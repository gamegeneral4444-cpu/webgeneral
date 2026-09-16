-- 0012_unit_post_attachments.sql — แนบได้หลายไฟล์ต่อหนึ่งโพสต์
--
-- เก็บเป็น jsonb array ในตารางเดิม ไม่แยกตารางใหม่ เพราะไฟล์แนบถูกดึงมาพร้อมโพสต์เสมอ
-- ไม่เคยต้องค้นหาหรือนับแยก จึงไม่คุ้มที่จะเพิ่มตาราง + RLS + join อีกชุด
--
-- รูปแบบแต่ละชิ้น: {"url": "...", "name": "...", "type": "image/png", "size": 12345}

alter table public.unit_posts
  add column if not exists attachments jsonb not null default '[]'::jsonb;

-- ย้ายไฟล์แนบเดิมที่เป็นลิงก์เดี่ยวเข้ามาอยู่ในรูปแบบใหม่ ไม่ให้ข้อมูลหาย
update public.unit_posts
set attachments = jsonb_build_array(
      jsonb_build_object('url', attachment_url, 'name', 'ไฟล์แนบ', 'type', '', 'size', 0)
    )
where attachment_url is not null
  and btrim(attachment_url) <> ''
  and attachments = '[]'::jsonb;

select id, title, attachments from public.unit_posts;
