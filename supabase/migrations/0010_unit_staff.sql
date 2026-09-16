-- 0010_unit_staff.sql — ใครรับผิดชอบงานไหน
--
-- ความสัมพันธ์เป็นแบบหลายต่อหลาย: หนึ่งคนเป็นหัวหน้าได้หลายงานและเป็นผู้ช่วยงานอื่นด้วย
-- จึงแยกเป็นตารางเชื่อม ไม่ยัดเป็นคอลัมน์ในตาราง staff
--
-- unit_slug อ้างอิง UNITS ใน lib/units.ts (รายชื่องานอยู่ในโค้ด ไม่ได้อยู่ในฐานข้อมูล)
-- จึงไม่มี foreign key ฝั่งนั้น แต่ฝั่ง staff ผูก FK ไว้ ลบบุคลากรแล้วบทบาทหายตาม

create table if not exists public.unit_staff (
  id         uuid primary key default gen_random_uuid(),
  unit_slug  text not null,
  staff_id   uuid not null references public.staff(id) on delete cascade,
  role       text not null check (role in ('head','assistant')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- คนเดียวกันเป็นทั้งหัวหน้าและผู้ช่วยของงานเดียวกันไม่ได้
  unique (unit_slug, staff_id)
);

create index if not exists unit_staff_unit_slug_idx
  on public.unit_staff (unit_slug, role, sort_order);

create index if not exists unit_staff_staff_id_idx
  on public.unit_staff (staff_id);

alter table public.unit_staff enable row level security;

-- ผังผู้รับผิดชอบเป็นข้อมูลสาธารณะ ใครก็อ่านได้
drop policy if exists "unit staff public read" on public.unit_staff;
create policy "unit staff public read" on public.unit_staff
  for select using (true);

-- แก้ผังได้เฉพาะแอดมิน เท่ากับสิทธิ์แก้ข้อมูลบุคลากร
drop policy if exists "unit staff manage" on public.unit_staff;
create policy "unit staff manage" on public.unit_staff
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

drop trigger if exists unit_staff_set_updated_at on public.unit_staff;
create trigger unit_staff_set_updated_at
  before update on public.unit_staff
  for each row execute function public.set_updated_at();
