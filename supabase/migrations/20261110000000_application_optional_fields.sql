-- Optional extra details on job applications: phone, LinkedIn/portfolio link, work experience, and a CV (PDF)
alter table public.applications
  add column phone text,
  add column profile_url text,
  add column experience text,
  add column cv text;

alter table public.applications
  add constraint applications_phone_len check (phone is null or char_length(phone) <= 30),
  add constraint applications_profile_url_fmt check (
    profile_url is null or (char_length(profile_url) <= 300 and profile_url ~* '^https?://[^\s]+$')
  ),
  add constraint applications_experience_len check (experience is null or char_length(experience) <= 1500),
  -- CV is a path in private storage, e.g. cv/cv1abc2def.pdf; never a public URL
  add constraint applications_cv_fmt check (cv is null or cv ~ '^cv/[A-Za-z0-9_-]+\.pdf$');
