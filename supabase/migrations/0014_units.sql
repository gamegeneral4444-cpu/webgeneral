-- 0014_units.sql — ย้ายกลุ่มงานเข้าฐานข้อมูล เพิ่ม/ลบ/แก้ได้จากหลังบ้าน
--
-- slug เป็นตัวเชื่อมกับ unit_posts และ unit_staff จึงห้ามแก้หลังมีข้อมูลแล้ว
-- ไม่ตั้ง foreign key ไว้โดยตั้งใจ เพื่อไม่ให้ลบงานแล้วโพสต์หายตามโดยไม่ตั้งใจ
-- ใช้ is_active ซ่อนแทนการลบ และห้ามลบถาวรถ้ายังมีโพสต์หรือผู้รับผิดชอบ

create table if not exists public.units (
  slug        text primary key,
  label       text not null,
  icon        text not null default 'HelpCircle',
  description text not null default '',
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists units_sort_idx on public.units (is_active, sort_order);

alter table public.units enable row level security;

drop policy if exists "units public read" on public.units;
create policy "units public read" on public.units
  for select using (
    is_active = true
    or public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

drop policy if exists "units manage" on public.units;
create policy "units manage" on public.units
  for all using (public.get_current_user_role() in ('super_admin','admin'))
  with check (public.get_current_user_role() in ('super_admin','admin'));

drop trigger if exists units_set_updated_at on public.units;
create trigger units_set_updated_at
  before update on public.units
  for each row execute function public.set_updated_at();

-- ใส่ 14 งานเดิม รันซ้ำไม่ทับของที่แก้ไปแล้ว
insert into public.units (slug, label, icon, description, sort_order) values
  ('building', $q$งานอาคารสถานที่$q$, 'Building2', $q$วางแผน ออกระเบียบดูแลและบำรุงรักษา นิเทศการใช้สถานที่ ระบบสาธารณูปโภค ซ่อมแซมอาคาร และจัดบริการสถานที่แก่บุคลากรและบุคคลภายนอก$q$, 1),
  ('av', $q$งานโสตทัศนูปกรณ์$q$, 'Projector', $q$จัดหา ดูแลบำรุงรักษา และให้บริการเครื่องมือโสตทัศนศึกษา เช่น เครื่องขยายเสียง เครื่องฉายภาพ$q$, 2),
  ('plan-info', $q$งานแผนปฏิบัติการและสารสนเทศ$q$, 'ClipboardList', $q$จัดทำแผนงาน งบประมาณ ปฏิทินปฏิบัติงาน สรุปข้อมูลสารสนเทศ นิเทศ ติดตาม และประเมินผล$q$, 3),
  ('supervision', $q$งานนิเทศ ติดตาม ประเมินผล และรายงานผล$q$, 'ClipboardCheck', $q$วางแผน จัดทำแบบฟอร์มการนิเทศ และประเมินผลการปฏิบัติงานของครูและบุคลากรเพื่อปรับปรุงประสิทธิภาพงาน$q$, 4),
  ('fundraising', $q$งานระดมทุนและทรัพยากร$q$, 'HandCoins', $q$ประสานงานระดมทุน จัดทำบัญชี จัดทำข้อมูลผู้พิการเพื่อขอทุน และประกาศเกียรติคุณผู้ทำคุณประโยชน์$q$, 5),
  ('nutrition', $q$งานโภชนาการ$q$, 'UtensilsCrossed', $q$ดูแลสุขลักษณะ สุขภาพอนามัย เมนูอาหาร คุณภาพอาหาร ยาและเวชภัณฑ์ ปลูกฝังสุขนิสัย และประสานงานโรงพยาบาลกรณีเจ็บป่วยหรืออุบัติเหตุ$q$, 6),
  ('health', $q$งานอนามัย$q$, 'HeartPulse', $q$ดูแลสุขลักษณะ สุขภาพอนามัย เมนูอาหาร คุณภาพอาหาร ยาและเวชภัณฑ์ ปลูกฝังสุขนิสัย และประสานงานโรงพยาบาลกรณีเจ็บป่วยหรืออุบัติเหตุ$q$, 7),
  ('security', $q$งานรักษาความปลอดภัย$q$, 'ShieldCheck', $q$จัดเวรยามดูแลความปลอดภัยและทรัพย์สินตลอด 24 ชั่วโมง ตรวจสอบระบบไฟฟ้าและสัญญาณเตือนภัย และรายงานเหตุการณ์ต่อผู้บังคับบัญชา$q$, 8),
  ('community', $q$งานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์$q$, 'Handshake', $q$สร้างความร่วมมือกับชุมชน ทั้งการประชุม ให้บริการสถานที่และอุปกรณ์ ร่วมกิจกรรมประเพณีวัฒนธรรม และจัดหาทุนสนับสนุน$q$, 9),
  ('student-support', $q$งานระบบดูแลช่วยเหลือนักเรียน$q$, 'HeartHandshake', $q$$q$, 10),
  ('student-affairs', $q$งานกิจการนักเรียน$q$, 'Users', $q$ส่งเสริมความถนัด ทักษะอาชีพ ศิลปะ กีฬา การอนุรักษ์วัฒนธรรม และการเรียนรู้ตลอดชีวิตของผู้เรียน$q$, 11),
  ('pr', $q$งานประชาสัมพันธ์และเผยแพร่$q$, 'Megaphone', $q$วางแผนประชาสัมพันธ์ ผลิตสื่อและวารสาร แจ้งข้อมูลข่าวสารผ่านสื่อต่าง ๆ และจัดต้อนรับคณะศึกษาดูงาน$q$, 12),
  ('vehicle', $q$งานยานพาหนะ$q$, 'Car', $q$บริการจัดยานพาหนะ จัดทำทะเบียนควบคุม บำรุงรักษารถ และกำกับดูแลพนักงานขับรถให้ปฏิบัติงานอย่างปลอดภัย$q$, 13),
  ('admin-office', $q$งานธุรการและสารบรรณ$q$, 'FileStack', $q$จัดทำ ลงทะเบียน รับ-ส่งหนังสือราชการ ออกคำสั่ง เก็บและทำลายเอกสาร จัดประชุม และบริการงานสารบรรณ$q$, 14)
on conflict (slug) do nothing;

-- ถ้าเคยรัน 0013 และแก้คำอธิบายไว้ ให้ยกมาใช้แทนค่าตั้งต้น
do $$
begin
  if to_regclass('public.unit_details') is not null then
    update public.units u
    set description = d.description
    from public.unit_details d
    where d.unit_slug = u.slug and btrim(d.description) <> '';
  end if;
end $$;

select slug, label, icon, sort_order, is_active from public.units order by sort_order;
