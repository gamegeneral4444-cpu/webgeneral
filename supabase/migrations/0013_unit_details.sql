-- 0013_unit_details.sql — คำอธิบายหน้าที่ของแต่ละกลุ่มงาน แก้ได้จากหลังบ้าน
--
-- รายชื่องานยังอยู่ในโค้ด (lib/units.ts) ตารางนี้เก็บเฉพาะข้อความที่แอดมินแก้ได้
-- ถ้าไม่มีแถวหรือข้อความว่าง หน้าเว็บจะใช้คำอธิบายสำรองในโค้ดแทน

create table if not exists public.unit_details (
  unit_slug   text primary key,
  description text not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.unit_details enable row level security;

drop policy if exists "unit details public read" on public.unit_details;
create policy "unit details public read" on public.unit_details
  for select using (true);

drop policy if exists "unit details manage" on public.unit_details;
create policy "unit details manage" on public.unit_details
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

drop trigger if exists unit_details_set_updated_at on public.unit_details;
create trigger unit_details_set_updated_at
  before update on public.unit_details
  for each row execute function public.set_updated_at();

-- ใส่ข้อความตั้งต้น รันซ้ำไม่ทับข้อความที่แอดมินแก้ไปแล้ว
insert into public.unit_details (unit_slug, description) values
  ('building', $d$วางแผน ออกระเบียบดูแลและบำรุงรักษา นิเทศการใช้สถานที่ ระบบสาธารณูปโภค ซ่อมแซมอาคาร และจัดบริการสถานที่แก่บุคลากรและบุคคลภายนอก$d$),
  ('av', $d$จัดหา ดูแลบำรุงรักษา และให้บริการเครื่องมือโสตทัศนศึกษา เช่น เครื่องขยายเสียง เครื่องฉายภาพ$d$),
  ('plan-info', $d$จัดทำแผนงาน งบประมาณ ปฏิทินปฏิบัติงาน สรุปข้อมูลสารสนเทศ นิเทศ ติดตาม และประเมินผล$d$),
  ('supervision', $d$วางแผน จัดทำแบบฟอร์มการนิเทศ และประเมินผลการปฏิบัติงานของครูและบุคลากรเพื่อปรับปรุงประสิทธิภาพงาน$d$),
  ('fundraising', $d$ประสานงานระดมทุน จัดทำบัญชี จัดทำข้อมูลผู้พิการเพื่อขอทุน และประกาศเกียรติคุณผู้ทำคุณประโยชน์$d$),
  ('nutrition', $d$ดูแลสุขลักษณะ สุขภาพอนามัย เมนูอาหาร คุณภาพอาหาร ยาและเวชภัณฑ์ ปลูกฝังสุขนิสัย และประสานงานโรงพยาบาลกรณีเจ็บป่วยหรืออุบัติเหตุ$d$),
  ('health', $d$ดูแลสุขลักษณะ สุขภาพอนามัย เมนูอาหาร คุณภาพอาหาร ยาและเวชภัณฑ์ ปลูกฝังสุขนิสัย และประสานงานโรงพยาบาลกรณีเจ็บป่วยหรืออุบัติเหตุ$d$),
  ('security', $d$จัดเวรยามดูแลความปลอดภัยและทรัพย์สินตลอด 24 ชั่วโมง ตรวจสอบระบบไฟฟ้าและสัญญาณเตือนภัย และรายงานเหตุการณ์ต่อผู้บังคับบัญชา$d$),
  ('community', $d$สร้างความร่วมมือกับชุมชน ทั้งการประชุม ให้บริการสถานที่และอุปกรณ์ ร่วมกิจกรรมประเพณีวัฒนธรรม และจัดหาทุนสนับสนุน$d$),
  ('student-affairs', $d$ส่งเสริมความถนัด ทักษะอาชีพ ศิลปะ กีฬา การอนุรักษ์วัฒนธรรม และการเรียนรู้ตลอดชีวิตของผู้เรียน$d$),
  ('pr', $d$วางแผนประชาสัมพันธ์ ผลิตสื่อและวารสาร แจ้งข้อมูลข่าวสารผ่านสื่อต่าง ๆ และจัดต้อนรับคณะศึกษาดูงาน$d$),
  ('vehicle', $d$บริการจัดยานพาหนะ จัดทำทะเบียนควบคุม บำรุงรักษารถ และกำกับดูแลพนักงานขับรถให้ปฏิบัติงานอย่างปลอดภัย$d$),
  ('admin-office', $d$จัดทำ ลงทะเบียน รับ-ส่งหนังสือราชการ ออกคำสั่ง เก็บและทำลายเอกสาร จัดประชุม และบริการงานสารบรรณ$d$)
on conflict (unit_slug) do nothing;

select unit_slug, left(description, 40) as ตัวอย่าง from public.unit_details order by unit_slug;
