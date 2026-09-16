alter table public.site_settings
  add column if not exists banner_image_url text;
