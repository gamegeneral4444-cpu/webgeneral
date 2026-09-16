-- =============================================================
-- 0002_rls_policies.sql
-- Row Level Security + Policies
-- อ้างอิงเอกสาร 07_SUPABASE_SECURITY_RLS.md (Role Matrix)
-- =============================================================

-- ---------- ฟังก์ชันดึง role ของผู้ใช้ปัจจุบัน ----------
create or replace function public.get_current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

-- ---------- เปิด RLS ทุกตาราง ----------
alter table public.profiles            enable row level security;
alter table public.news                enable row level security;
alter table public.news_categories     enable row level security;
alter table public.documents           enable row level security;
alter table public.document_categories enable row level security;
alter table public.services            enable row level security;
alter table public.service_categories  enable row level security;
alter table public.gallery_albums      enable row level security;
alter table public.gallery_images      enable row level security;
alter table public.staff               enable row level security;
alter table public.site_settings       enable row level security;
alter table public.audit_logs          enable row level security;

-- =========================================================
-- PROFILES
-- =========================================================
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (auth.uid() = id or public.get_current_user_role() in ('super_admin','admin'));

drop policy if exists "profiles super admin manage" on public.profiles;
create policy "profiles super admin manage" on public.profiles
  for all using (public.get_current_user_role() = 'super_admin')
  with check (public.get_current_user_role() = 'super_admin');

-- =========================================================
-- NEWS
-- =========================================================
drop policy if exists "news public read" on public.news;
create policy "news public read" on public.news
  for select using (
    status = 'published'
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "news write insert" on public.news;
create policy "news write insert" on public.news
  for insert with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop policy if exists "news write update" on public.news;
create policy "news write update" on public.news
  for update using (public.get_current_user_role() in ('super_admin','admin','editor'))
  with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop policy if exists "news delete" on public.news;
create policy "news delete" on public.news
  for delete using (public.get_current_user_role() in ('super_admin','admin'));

-- =========================================================
-- DOCUMENTS
-- =========================================================
drop policy if exists "documents public read" on public.documents;
create policy "documents public read" on public.documents
  for select using (
    is_published = true
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "documents write insert" on public.documents;
create policy "documents write insert" on public.documents
  for insert with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop policy if exists "documents write update" on public.documents;
create policy "documents write update" on public.documents
  for update using (public.get_current_user_role() in ('super_admin','admin','editor'))
  with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop policy if exists "documents delete" on public.documents;
create policy "documents delete" on public.documents
  for delete using (public.get_current_user_role() in ('super_admin','admin'));

-- =========================================================
-- SERVICES
-- =========================================================
drop policy if exists "services public read" on public.services;
create policy "services public read" on public.services
  for select using (
    status <> 'inactive'
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "services manage" on public.services;
create policy "services manage" on public.services
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

-- =========================================================
-- GALLERY (albums + images)
-- =========================================================
drop policy if exists "gallery albums public read" on public.gallery_albums;
create policy "gallery albums public read" on public.gallery_albums
  for select using (
    is_published = true
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "gallery albums write insert" on public.gallery_albums;
create policy "gallery albums write insert" on public.gallery_albums
  for insert with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop policy if exists "gallery albums write update" on public.gallery_albums;
create policy "gallery albums write update" on public.gallery_albums
  for update using (public.get_current_user_role() in ('super_admin','admin','editor'))
  with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop policy if exists "gallery albums delete" on public.gallery_albums;
create policy "gallery albums delete" on public.gallery_albums
  for delete using (public.get_current_user_role() in ('super_admin','admin'));

drop policy if exists "gallery images public read" on public.gallery_images;
create policy "gallery images public read" on public.gallery_images
  for select using (
    exists (select 1 from public.gallery_albums a
            where a.id = album_id and a.is_published = true)
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "gallery images manage" on public.gallery_images;
create policy "gallery images manage" on public.gallery_images
  for all using (public.get_current_user_role() in ('super_admin','admin','editor'))
  with check (public.get_current_user_role() in ('super_admin','admin','editor'));

-- =========================================================
-- STAFF
-- =========================================================
drop policy if exists "staff public read" on public.staff;
create policy "staff public read" on public.staff
  for select using (
    is_active = true
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "staff manage" on public.staff;
create policy "staff manage" on public.staff
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

-- =========================================================
-- CATEGORIES (news / document / service) — public read active
-- =========================================================
do $$
declare t text;
begin
  foreach t in array array['news_categories','document_categories','service_categories']
  loop
    execute format('drop policy if exists "%1$s public read" on public.%1$s;', t);
    execute format(
      'create policy "%1$s public read" on public.%1$s
       for select using (is_active = true
         or public.get_current_user_role() in (''super_admin'',''admin'',''editor'',''viewer''));', t);

    execute format('drop policy if exists "%1$s manage" on public.%1$s;', t);
    execute format(
      'create policy "%1$s manage" on public.%1$s
       for all using (public.get_current_user_role() in (''super_admin'',''admin''))
       with check (public.get_current_user_role() in (''super_admin'',''admin''));', t);
  end loop;
end $$;

-- =========================================================
-- SITE SETTINGS — public read, admin manage
-- =========================================================
drop policy if exists "site settings public read" on public.site_settings;
create policy "site settings public read" on public.site_settings
  for select using (true);

drop policy if exists "site settings manage" on public.site_settings;
create policy "site settings manage" on public.site_settings
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

-- =========================================================
-- AUDIT LOGS — admin read only
-- =========================================================
drop policy if exists "audit logs read" on public.audit_logs;
create policy "audit logs read" on public.audit_logs
  for select using (public.get_current_user_role() in ('super_admin','admin'));
