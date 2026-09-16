-- ============================================================
-- รวม 3 ขั้นตอนไว้ในไฟล์เดียว — วางทั้งหมดใน Supabase SQL Editor แล้วกด Run
--
-- 1) ตาราง unit_posts   : ระบบลงงาน/อัปเดตความคืบหน้าของแต่ละงาน
-- 2) ตาราง unit_staff   : ผูกบุคลากรเข้ากับงาน (หัวหน้า/ผู้ช่วย)
-- 3) ข้อมูลบุคลากร 18 คน + ผังบทบาท
--
-- รันซ้ำได้ ไม่พัง (ใช้ if not exists / on conflict ทั้งหมด)
-- แต่ขั้นที่ 3 จะเขียนทับ ตำแหน่ง/หน้าที่/ลำดับ กลับเป็นค่าในไฟล์นี้
-- ถ้าแก้ในหน้าแอดมินไปแล้วและไม่อยากให้ทับ ให้ลบส่วน "3.2" ออกก่อนรัน
--
-- ⚠️ ชื่อบุคลากรถอดมาจากภาพผัง ยังไม่ได้เทียบทะเบียนบุคลากร
--    ชื่อที่เสี่ยงอ่านผิดที่สุด: ชนกพร ปิยศทิพย์ · เมญจมาศ เหลืองช่างทอง · วันณา ใจปลื้ม
-- ============================================================


-- ============================================================
-- 1) unit_posts — โพสต์งานของแต่ละงาน (แยกจากข่าวประชาสัมพันธ์)
-- ============================================================
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

create index if not exists unit_posts_unit_slug_idx on public.unit_posts (unit_slug, posted_at desc);
create index if not exists unit_posts_status_idx    on public.unit_posts (status);

alter table public.unit_posts enable row level security;

drop policy if exists "unit posts public read" on public.unit_posts;
create policy "unit posts public read" on public.unit_posts
  for select using (
    status = 'published'
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "unit posts manage" on public.unit_posts;
create policy "unit posts manage" on public.unit_posts
  for all using (public.get_current_user_role() in ('super_admin','admin','editor'))
  with check (public.get_current_user_role() in ('super_admin','admin','editor'));

drop trigger if exists unit_posts_set_updated_at on public.unit_posts;
create trigger unit_posts_set_updated_at
  before update on public.unit_posts
  for each row execute function public.set_updated_at();


-- ============================================================
-- 2) unit_staff — ใครรับผิดชอบงานไหน
-- ============================================================
create table if not exists public.unit_staff (
  id         uuid primary key default gen_random_uuid(),
  unit_slug  text not null,
  staff_id   uuid not null references public.staff(id) on delete cascade,
  role       text not null check (role in ('head','assistant')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (unit_slug, staff_id)
);

create index if not exists unit_staff_unit_slug_idx on public.unit_staff (unit_slug, role, sort_order);
create index if not exists unit_staff_staff_id_idx  on public.unit_staff (staff_id);

alter table public.unit_staff enable row level security;

drop policy if exists "unit staff public read" on public.unit_staff;
create policy "unit staff public read" on public.unit_staff
  for select using (true);

drop policy if exists "unit staff manage" on public.unit_staff;
create policy "unit staff manage" on public.unit_staff
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

drop trigger if exists unit_staff_set_updated_at on public.unit_staff;
create trigger unit_staff_set_updated_at
  before update on public.unit_staff
  for each row execute function public.set_updated_at();


-- ============================================================
-- 3) บุคลากร 18 คน + ผังบทบาท
-- ============================================================

-- 3.0 พักข้อมูลไว้ในตารางชั่วคราว จะได้เขียนรายชื่อครั้งเดียว
create temporary table _roster (
  full_name      text,
  position       text,
  department     text,
  responsibility text,
  sort_order     int
) on commit drop;

insert into _roster values
  ('นางสาวภัทรภร หมื่นมะเริง',      'ผู้อำนวยการสถานศึกษา',      'ผู้บริหารสถานศึกษา', null, 1),
  ('นายชัยธวัช สาทถาพร',            'รองผู้อำนวยการสถานศึกษา',   'ผู้บริหารสถานศึกษา', null, 2),
  ('นายคามิน หล้าก่ำ',              'หัวหน้าฝ่ายบริหารทั่วไป',    'ฝ่ายบริหารทั่วไป', 'หัวหน้างานอาคารสถานที่, หัวหน้างานโสตทัศนูปกรณ์, หัวหน้างานแผนปฏิบัติการและสารสนเทศ', 3),
  ('นางสาวจารุณี แดนคำสาร',         'รองหัวหน้าฝ่ายบริหารทั่วไป', 'ฝ่ายบริหารทั่วไป', 'หัวหน้างานนิเทศ ติดตาม ประเมินผล และรายงานผล, หัวหน้างานระดมทุนและทรัพยากร', 4),
  ('นางสาววรทิพย์ ปลื้มสกุลไทย',     'ครู',                      'ฝ่ายบริหารทั่วไป', 'หัวหน้างานโภชนาการ, ผู้ช่วยงานอนามัย', 5),
  ('นางสาวเกศดา จันทร์กรง',         'ครู',                      'ฝ่ายบริหารทั่วไป', 'หัวหน้างานอนามัย, ผู้ช่วยงานโภชนาการ', 6),
  ('นายประเสริฐ อาด่ำ',             'ครู',                      'ฝ่ายบริหารทั่วไป', 'หัวหน้างานรักษาความปลอดภัย, ผู้ช่วยงานยานพาหนะ', 7),
  ('นางสาวศรินทรรัตน์ สกุลปทุมทอง',  'ครู',                      'ฝ่ายบริหารทั่วไป', 'หัวหน้างานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์, หัวหน้างานระบบดูแลช่วยเหลือนักเรียน', 8),
  ('นางสาวปรียาพร พิมภาค',          'พนักงานราชการ',            'ฝ่ายบริหารทั่วไป', 'หัวหน้างานกิจการนักเรียน', 9),
  ('นางสาวจีระนันท์ สรรพเจริญสิน',   'พนักงานราชการ',            'ฝ่ายบริหารทั่วไป', 'หัวหน้างานประชาสัมพันธ์และเผยแพร่, ผู้ช่วยงานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์', 10),
  ('นายเจษฎา ธรรมศิลป์',            'พนักงานราชการ',            'ฝ่ายบริหารทั่วไป', 'หัวหน้างานยานพาหนะ, ผู้ช่วยงานอาคารสถานที่', 11),
  ('นายรพีพล แสนเวียง',             'ครูอัตราจ้าง',              'ฝ่ายบริหารทั่วไป', 'ผู้ช่วยงานอาคารสถานที่, ผู้ช่วยงานรักษาความปลอดภัย', 12),
  ('นายเทพนรงค์ คงบางใหญ่',         'ครูอัตราจ้าง',              'ฝ่ายบริหารทั่วไป', 'ผู้ช่วยงานประชาสัมพันธ์และเผยแพร่, ผู้ช่วยงานโสตทัศนูปกรณ์', 13),
  ('นางสาวบุญญิสา โพธิ์แย้ม',        'ครูอัตราจ้าง',              'ฝ่ายบริหารทั่วไป', 'ผู้ช่วยงานประชาสัมพันธ์และเผยแพร่, ผู้ช่วยงานธุรการ', 14),
  ('นางสาวชนกพร ปิยศทิพย์',         'จ้างเหมาบริการ',            'ฝ่ายบริหารทั่วไป', 'หัวหน้างานธุรการและสารบรรณ', 15),
  ('นางสาวเมญจมาศ เหลืองช่างทอง',   'จ้างเหมาบริการ',            'ฝ่ายบริหารทั่วไป', 'ผู้ช่วยกลุ่มงาน', 16),
  ('นางสาวเมทินี ปรีชากุล',          'จ้างเหมาบริการ',            'ฝ่ายบริหารทั่วไป', 'ผู้ช่วยกลุ่มงาน', 17),
  ('นางสาววันณา ใจปลื้ม',           'จ้างเหมาบริการ',            'ฝ่ายบริหารทั่วไป', 'ผู้ช่วยกลุ่มงาน', 18);

-- 3.1 เพิ่มเฉพาะคนที่ยังไม่มีในระบบ
insert into public.staff (full_name, position, department, responsibility, sort_order, is_active)
select r.full_name, r.position, r.department, r.responsibility, r.sort_order, true
from _roster r
where not exists (select 1 from public.staff s where s.full_name = r.full_name);

-- 3.2 อัปเดตคนที่มีอยู่แล้ว (ไม่แตะรูป) — ลบส่วนนี้ออกถ้าไม่อยากให้เขียนทับ
update public.staff s
set position       = r.position,
    department     = r.department,
    responsibility = r.responsibility,
    sort_order     = r.sort_order,
    is_active      = true
from _roster r
where s.full_name = r.full_name;

-- 3.3 ผังบทบาท (ลำดับ 16-18 เป็นผู้ช่วยกลุ่มงาน ไม่ระบุงานเจาะจง จึงไม่มีในผังนี้)
with assign(full_name, unit_slug, role) as (
  values
    ('นายคามิน หล้าก่ำ',              'building',        'head'),
    ('นายคามิน หล้าก่ำ',              'av',              'head'),
    ('นายคามิน หล้าก่ำ',              'plan-info',       'head'),
    ('นางสาวจารุณี แดนคำสาร',         'supervision',     'head'),
    ('นางสาวจารุณี แดนคำสาร',         'fundraising',     'head'),
    ('นางสาววรทิพย์ ปลื้มสกุลไทย',     'nutrition',       'head'),
    ('นางสาววรทิพย์ ปลื้มสกุลไทย',     'health',          'assistant'),
    ('นางสาวเกศดา จันทร์กรง',         'health',          'head'),
    ('นางสาวเกศดา จันทร์กรง',         'nutrition',       'assistant'),
    ('นายประเสริฐ อาด่ำ',             'security',        'head'),
    ('นายประเสริฐ อาด่ำ',             'vehicle',         'assistant'),
    ('นางสาวศรินทรรัตน์ สกุลปทุมทอง',  'community',       'head'),
    ('นางสาวศรินทรรัตน์ สกุลปทุมทอง',  'student-support', 'head'),
    ('นางสาวปรียาพร พิมภาค',          'student-affairs', 'head'),
    ('นางสาวจีระนันท์ สรรพเจริญสิน',   'pr',              'head'),
    ('นางสาวจีระนันท์ สรรพเจริญสิน',   'community',       'assistant'),
    ('นายเจษฎา ธรรมศิลป์',            'vehicle',         'head'),
    ('นายเจษฎา ธรรมศิลป์',            'building',        'assistant'),
    ('นายรพีพล แสนเวียง',             'building',        'assistant'),
    ('นายรพีพล แสนเวียง',             'security',        'assistant'),
    ('นายเทพนรงค์ คงบางใหญ่',         'pr',              'assistant'),
    ('นายเทพนรงค์ คงบางใหญ่',         'av',              'assistant'),
    ('นางสาวบุญญิสา โพธิ์แย้ม',        'pr',              'assistant'),
    ('นางสาวบุญญิสา โพธิ์แย้ม',        'admin-office',    'assistant'),
    ('นางสาวชนกพร ปิยศทิพย์',         'admin-office',    'head')
)
insert into public.unit_staff (unit_slug, staff_id, role, sort_order)
select a.unit_slug, s.id, a.role, s.sort_order
from assign a
join public.staff s on s.full_name = a.full_name
on conflict (unit_slug, staff_id)
do update set role = excluded.role, sort_order = excluded.sort_order;


-- ============================================================
-- ตรวจผล — ควรได้ staff อย่างน้อย 18 แถว และ unit_staff 25 แถว
-- ============================================================
select 'staff' as ตาราง, count(*) as จำนวน from public.staff
union all
select 'unit_staff', count(*) from public.unit_staff
union all
select 'unit_posts', count(*) from public.unit_posts;
