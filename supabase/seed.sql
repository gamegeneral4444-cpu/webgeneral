-- =============================================================
-- seed.sql — ข้อมูลตั้งต้นสำหรับเว็บไซต์กลุ่มบริหารงานทั่วไป
-- รันหลัง migrations ทั้งหมด (idempotent ด้วย on conflict)
-- =============================================================

-- ---------- ตั้งค่าเว็บไซต์ ----------
insert into public.site_settings (site_name, school_name, primary_color, address, phone, email, facebook_url, office_hours)
select 'กลุ่มบริหารงานทั่วไป', 'โรงเรียนตัวอย่างวิทยา', '#b45309',
       '123 ถนนตัวอย่าง ตำบลในเมือง อำเภอเมือง จังหวัดตัวอย่าง 10000',
       '0-2123-4567', 'general@example.ac.th', 'https://facebook.com/example.school',
       'จันทร์ - ศุกร์ 08.30 - 16.30 น.'
where not exists (select 1 from public.site_settings);

-- ---------- หมวดหมู่ข่าว ----------
insert into public.news_categories (name, slug, sort_order) values
  ('ทั่วไป', 'general', 1),
  ('ประกาศ', 'announcement', 2),
  ('กิจกรรม', 'activity', 3),
  ('จัดซื้อจัดจ้าง', 'procurement', 4)
on conflict (slug) do nothing;

-- ---------- หมวดหมู่เอกสาร ----------
insert into public.document_categories (name, slug, sort_order) values
  ('แบบฟอร์มทั่วไป', 'forms', 1),
  ('คำสั่ง', 'orders', 2),
  ('ระเบียบ', 'regulations', 3),
  ('คู่มือ', 'manuals', 4),
  ('หนังสือราชการ', 'official-letters', 5),
  ('งานอาคารสถานที่', 'facilities', 6),
  ('งานยานพาหนะ', 'vehicles', 7)
on conflict (slug) do nothing;

-- ---------- หมวดหมู่บริการ ----------
insert into public.service_categories (name, slug, sort_order) values
  ('บริการออนไลน์', 'online', 1),
  ('ดาวน์โหลด', 'download', 2)
on conflict (slug) do nothing;

-- ---------- ระบบบริการออนไลน์ ----------
insert into public.services (name, description, icon, url, status, sort_order, is_external) values
  ('ขอใช้อาคารสถานที่', 'จองและขออนุญาตใช้อาคารสถานที่ของโรงเรียน', 'Building2', '#', 'active', 1, false),
  ('จองรถราชการ', 'ขอใช้และจองรถยนต์ราชการสำหรับการเดินทาง', 'Car', '#', 'active', 2, false),
  ('แจ้งซ่อม', 'แจ้งซ่อมอุปกรณ์และระบบสาธารณูปโภค', 'Wrench', '#', 'active', 3, false),
  ('จองอาหารว่าง/เบรก', 'สั่งจองอาหารว่างสำหรับการประชุมและกิจกรรม', 'Coffee', '#', 'maintenance', 4, false),
  ('รวมภาพกิจกรรม', 'ชมภาพกิจกรรมของกลุ่มบริหารงานทั่วไป', 'Images', '/gallery', 'active', 5, false),
  ('ดาวน์โหลดแบบฟอร์ม', 'ดาวน์โหลดแบบฟอร์มและเอกสารราชการ', 'FileText', '/downloads', 'active', 6, false)
on conflict do nothing;

-- ---------- บุคลากร ----------
insert into public.staff (full_name, position, responsibility, phone, email, sort_order) values
  ('นายตัวอย่าง ใจดี', 'หัวหน้ากลุ่มบริหารงานทั่วไป', 'กำกับดูแลภาพรวมงานบริหารทั่วไป', '081-000-0001', 'head@example.ac.th', 1),
  ('นางสาวตัวอย่าง ขยัน', 'งานสารบรรณ', 'รับ-ส่งหนังสือราชการและงานธุรการ', '081-000-0002', 'doc@example.ac.th', 2),
  ('นายตัวอย่าง มานะ', 'งานอาคารสถานที่', 'ดูแลอาคารสถานที่และสาธารณูปโภค', '081-000-0003', 'building@example.ac.th', 3),
  ('นางตัวอย่าง อดทน', 'งานยานพาหนะ', 'ดูแลและจัดการรถยนต์ราชการ', '081-000-0004', 'car@example.ac.th', 4)
on conflict do nothing;

-- ---------- ข่าวตัวอย่าง ----------
insert into public.news (title, slug, excerpt, content, status, is_featured, published_at, category_id)
select
  'ยินดีต้อนรับสู่เว็บไซต์กลุ่มบริหารงานทั่วไป',
  'welcome-general-affairs',
  'เปิดตัวเว็บไซต์ใหม่ของกลุ่มบริหารงานทั่วไป รวมข่าวสาร เอกสาร และบริการออนไลน์ไว้ในที่เดียว',
  E'กลุ่มบริหารงานทั่วไปได้เปิดตัวเว็บไซต์ใหม่ เพื่อเป็นศูนย์รวมข่าวสาร เอกสารดาวน์โหลด ระบบบริการออนไลน์ และข้อมูลบุคลากร\n\nผู้ใช้งานสามารถเข้าถึงบริการต่าง ๆ ได้สะดวกและรวดเร็วยิ่งขึ้น',
  'published', true, now(),
  (select id from public.news_categories where slug = 'announcement' limit 1)
where not exists (select 1 from public.news where slug = 'welcome-general-affairs');

insert into public.news (title, slug, excerpt, content, status, published_at, category_id)
select
  'แนวปฏิบัติการขอใช้อาคารสถานที่ ประจำปีการศึกษา',
  'facility-booking-guideline',
  'แจ้งแนวปฏิบัติและขั้นตอนการขอใช้อาคารสถานที่สำหรับบุคลากรและหน่วยงานภายนอก',
  E'เพื่อให้การขอใช้อาคารสถานที่เป็นไปด้วยความเรียบร้อย กลุ่มบริหารงานทั่วไปขอแจ้งแนวปฏิบัติ ดังนี้\n\n1. ยื่นแบบฟอร์มล่วงหน้าอย่างน้อย 3 วันทำการ\n2. ระบุวัตถุประสงค์และช่วงเวลาที่ชัดเจน\n3. รอการอนุมัติก่อนใช้งานทุกครั้ง',
  'published', now() - interval '2 day',
  (select id from public.news_categories where slug = 'general' limit 1)
where not exists (select 1 from public.news where slug = 'facility-booking-guideline');

-- ---------- อัลบั้มตัวอย่าง ----------
insert into public.gallery_albums (title, slug, description, event_date, is_published)
select 'กิจกรรมตัวอย่างของกลุ่มบริหารงานทั่วไป', 'sample-activity',
       'ภาพบรรยากาศกิจกรรมตัวอย่าง', current_date, true
where not exists (select 1 from public.gallery_albums where slug = 'sample-activity');
