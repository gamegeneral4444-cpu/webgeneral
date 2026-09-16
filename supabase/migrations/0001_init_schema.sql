-- =============================================================
-- 0001_init_schema.sql
-- โครงสร้างฐานข้อมูล: เว็บไซต์กลุ่มบริหารงานทั่วไป
-- อ้างอิงเอกสาร 06_DATABASE_DESIGN.md
-- =============================================================

-- ---------- ฟังก์ชันอัปเดต updated_at อัตโนมัติ ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles (ผู้ดูแลระบบ) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null default 'viewer' check (role in ('super_admin','admin','editor','viewer')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- หมวดหมู่ข่าว ----------
create table if not exists public.news_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ข่าว ----------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  category_id uuid references public.news_categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  is_featured boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- หมวดหมู่เอกสาร ----------
create table if not exists public.document_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- เอกสาร ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text not null,
  file_name text,
  file_type text,
  file_size bigint,
  category_id uuid references public.document_categories(id) on delete set null,
  download_count int not null default 0,
  is_published boolean not null default true,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- หมวดหมู่บริการ ----------
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ระบบบริการออนไลน์ ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  url text not null,
  category_id uuid references public.service_categories(id) on delete set null,
  status text not null default 'active' check (status in ('active','maintenance','inactive')),
  sort_order int not null default 0,
  is_external boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- อัลบั้มภาพกิจกรรม ----------
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  event_date date,
  is_published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- รูปในอัลบั้ม ----------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid references public.gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- บุคลากร ----------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text not null,
  department text default 'กลุ่มบริหารงานทั่วไป',
  responsibility text,
  phone text,
  email text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- ตั้งค่าเว็บไซต์ ----------
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'กลุ่มบริหารงานทั่วไป',
  school_name text,
  logo_url text,
  primary_color text default '#b45309',
  address text,
  phone text,
  email text,
  facebook_url text,
  map_embed_url text,
  office_hours text,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------- audit logs (Version 2) ----------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists idx_news_status on public.news(status);
create index if not exists idx_news_published_at on public.news(published_at desc);
create index if not exists idx_news_category on public.news(category_id);
create index if not exists idx_documents_category on public.documents(category_id);
create index if not exists idx_documents_published on public.documents(is_published);
create index if not exists idx_services_status on public.services(status);
create index if not exists idx_staff_sort_order on public.staff(sort_order);
create index if not exists idx_gallery_albums_event_date on public.gallery_albums(event_date desc);
create index if not exists idx_gallery_images_album on public.gallery_images(album_id);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','news','documents','services','gallery_albums','staff']
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
       for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ---------- auto-create profile เมื่อมี user ใหม่ ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'viewer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- ฟังก์ชันเพิ่มยอดดาวน์โหลด ----------
create or replace function public.increment_download_count(doc_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.documents set download_count = download_count + 1 where id = doc_id;
$$;
