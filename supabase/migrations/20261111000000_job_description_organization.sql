-- Jobs: a free-text "who needs help" name (not only startups) and a description.
alter table public.listings
  add column organization text not null default '',
  add column description text;

-- Existing listings keep showing the startup they were posted for.
update public.listings l
set organization = s.name
from public.startups s
where s.slug = l.startup_slug and l.organization = '';

-- A listing no longer has to belong to a startup (the link stays for older listings).
alter table public.listings alter column startup_slug drop not null;

alter table public.listings
  add constraint listings_organization_len check (char_length(organization) <= 80),
  add constraint listings_description_len check (description is null or char_length(description) <= 1500);
