alter table public.site_settings
  add column if not exists line_url text,
  add column if not exists youtube_url text;
