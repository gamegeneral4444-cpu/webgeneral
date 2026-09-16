-- 0009_unit_posts.sql — โพสต์งานของแต่ละงานในฝ่ายบริหารงานทั่วไป
--
-- แยกจากตาราง news โดยตั้งใจ: โพสต์งานจะไม่ไปปนกับข่าวประชาสัมพันธ์
-- อ้างอิงงานด้วย unit_slug (text) ตรงกับ UNITS ใน lib/units.ts
-- ไม่ทำเป็น foreign key เพราะรายชื่องานอยู่ในโค้ด ไม่ได้อยู่ในฐานข้อมูล

create table if not exists public.unit_posts (
  id             uuid primary key default gen_random_uuid(),
  unit_slug      text not null,
  title          text not null,
  body           text not null default '',
  attachment_url text,
  status         text not null default 'draft' check (status in ('draft','published')),
  posted_at      timestamptz,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- หน้าย่อยดึงด้วย unit_slug แล้วเรียงตาม posted_at เสมอ
create index if not exists unit_posts_unit_slug_idx
  on public.unit_posts (unit_slug, posted_at desc);

create index if not exists unit_posts_status_idx
  on public.unit_posts (status);

alter table public.unit_posts enable row level security;

-- คนทั่วไปเห็นเฉพาะที่เผยแพร่แล้ว ส่วนคนในระบบเห็นฉบับร่างด้วย
drop policy if exists "unit posts public read" on public.unit_posts;
create policy "unit posts public read" on public.unit_posts
  for select using (
    status = 'published'
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

-- editor ลงงานได้ เพราะผู้รับผิดชอบแต่ละงานไม่จำเป็นต้องเป็นแอดมิน
drop policy if exists "unit posts manage" on public.unit_posts;
create policy "unit posts manage" on public.unit_posts
  for all using (public.get_current_user_role() in ('super_admin','admin','editor'))
  with check (public.get_current_user_role() in ('super_admin','admin','editor'));

-- ใช้ฟังก์ชัน set_updated_at ที่ 0001_init_schema.sql สร้างไว้แล้ว
drop trigger if exists unit_posts_set_updated_at on public.unit_posts;
create trigger unit_posts_set_updated_at
  before update on public.unit_posts
  for each row execute function public.set_updated_at();
