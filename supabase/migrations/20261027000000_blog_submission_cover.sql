-- Add optional cover photo to blog submissions and copy it to blog_posts on approval
alter table public.blog_submissions add column cover text;

create or replace function public.approve_blog_submission(
  p_id text,
  p_uid text,
  p_base_slug text,
  p_publish_date date,
  p_reviewer text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission public.blog_submissions%rowtype;
  v_slug text;
  v_suffix integer := 2;
  v_position integer;
begin
  select * into v_submission
  from public.blog_submissions
  where id = p_id
  for update;

  if not found then
    raise exception 'That blog submission no longer exists';
  end if;

  if v_submission.status = 'approved' and v_submission.post_slug is not null then
    return v_submission.post_slug;
  end if;

  if p_uid is null or p_uid = '' or p_base_slug is null
    or p_base_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid blog post details';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_base_slug));
  v_slug := p_base_slug;
  while exists (select 1 from public.blog_posts where slug = v_slug) loop
    v_slug := p_base_slug || '-' || v_suffix;
    v_suffix := v_suffix + 1;
  end loop;

  select coalesce(max(position), -1) + 1 into v_position from public.blog_posts;

  insert into public.blog_posts (uid, slug, title, summary, body, author, date, cover, position)
  values (
    p_uid, v_slug, v_submission.title, v_submission.summary, v_submission.body,
    v_submission.author, p_publish_date, v_submission.cover, v_position
  );

  update public.blog_submissions
  set status = 'approved',
      rejection_reason = null,
      post_slug = v_slug,
      reviewed_by = nullif(pg_catalog.btrim(p_reviewer), ''),
      reviewed_at = pg_catalog.clock_timestamp()
  where id = p_id;

  update public.content_section_revisions
  set revision = revision + 1
  where section = 'posts';

  return v_slug;
end;
$$;

revoke all on function public.approve_blog_submission(text, text, text, date, text) from public, anon, authenticated;
grant execute on function public.approve_blog_submission(text, text, text, date, text) to service_role;

