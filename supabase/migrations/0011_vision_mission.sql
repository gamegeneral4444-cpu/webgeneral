-- 0011_vision_mission.sql — วิสัยทัศน์และพันธกิจ แก้ได้จากหน้าตั้งค่าแอดมิน
--
-- เดิมข้อความสองก้อนนี้ฝังอยู่ในโค้ดหน้า /about ต้องแก้โค้ดแล้ว deploy ทุกครั้ง
-- ย้ายมาเก็บในฐานข้อมูลเพื่อให้แอดมินแก้เองได้
--
-- mission เก็บเป็นข้อความหลายบรรทัด หนึ่งบรรทัด = พันธกิจหนึ่งข้อ
-- หน้าเว็บจะแยกบรรทัดแล้วแสดงเป็นรายการหัวข้อย่อยให้เอง

alter table public.site_settings add column if not exists vision  text;
alter table public.site_settings add column if not exists mission text;

-- ใส่ค่าตั้งต้นให้แถวที่ยังว่าง จะได้ไม่ขึ้นหน้าเปล่าก่อนแอดมินเข้าไปกรอก
update public.site_settings
set vision = 'มุ่งพัฒนาศักยภาพเด็กพิเศษให้มีคุณภาพเต็มตามศักยภาพ สามารถดำเนินชีวิตในสังคมได้อย่างปกติสุข โดยการมีส่วนร่วมของภาคีเครือข่ายที่หลากหลาย'
where vision is null or btrim(vision) = '';

update public.site_settings
set mission = 'สนับสนุนงานบริหารทั่วไปให้ดำเนินไปอย่างมีระบบ
พัฒนาการให้บริการแก่ครู บุคลากร นักเรียน และผู้ปกครอง
นำเทคโนโลยีมาใช้เพื่อลดขั้นตอนและเอกสารกระดาษ
ดูแลอาคารสถานที่และสภาพแวดล้อมให้ปลอดภัย น่าอยู่'
where mission is null or btrim(mission) = '';

select vision, mission from public.site_settings;
