# Admin Dashboard & Modular CMS Design

วันที่: 23 มิถุนายน 2569
สถานะ: ผู้ใช้อนุมัติแนวคิดและหน้าตาแล้ว รอตรวจเอกสารก่อน implementation

## 1. เป้าหมาย

พัฒนา Admin Dashboard ของเว็บไซต์กลุ่มบริหารงานทั่วไปให้เป็น CMS แบบ modular ที่ผู้ดูแลสามารถเพิ่ม แก้ไข ลบ จัดลำดับ และเผยแพร่ข้อมูลทั้งหมดที่เว็บไซต์สาธารณะใช้ได้จากที่เดียว โดยใช้ Supabase เป็นแหล่งข้อมูลหลักและคงการ deploy บน Vercel

ผลลัพธ์ต้องมีหน้าตาใกล้เคียงภาพอ้างอิงที่ผู้ใช้แนบชื่อ `ChatGPT Image Jun 22, 2026, 11_44_17 PM.png` แต่ใช้ข้อมูล โมดูล สิทธิ์ และตราสัญลักษณ์ของเว็บไซต์จริง

## 2. ขอบเขต

### อยู่ในขอบเขต

- Dashboard ภาพรวมพร้อม KPI, quick actions, ตารางล่าสุด, activity timeline และ analytics
- CRUD ข่าว เอกสาร บริการ อัลบั้มภาพ รูปกิจกรรม และบุคลากร
- CRUD หมวดหมู่ข่าว หมวดหมู่เอกสาร และหมวดหมู่บริการ
- จัดการคำบรรยายและลำดับรูปในอัลบั้ม
- ตั้งค่าเว็บไซต์ โลโก้ สี ข้อมูลติดต่อ เวลาทำการ และแผนที่
- ดูผู้ใช้งาน ปรับ role และเปิด/ปิดบัญชี
- Audit log สำหรับการเพิ่ม แก้ไข ลบ และเปลี่ยนสถานะ
- Vercel Web Analytics และสถิติ page views บน Dashboard
- Responsive, accessibility, validation, error handling และการทดสอบ

### ไม่อยู่ในขอบเขต

- สร้างหรือลบบัญชี Supabase Auth จาก Dashboard ผู้ใช้จะสร้างบัญชีใน Supabase Dashboard
- ระบบการเงิน การชำระเงิน หรือ workflow อนุมัติหลายขั้น
- การแก้ไข schema แบบอิสระจากหน้าเว็บ
- การแสดงข้อมูล analytics ที่ Vercel ไม่เปิดให้เข้าถึงอย่างปลอดภัยหรือไม่รองรับในแพ็กเกจปัจจุบัน

## 3. Visual Design

### ภาษาภาพ

- Primary navy: `#082B55`
- Secondary navy: `#0B3A70`
- Accent gold: `#D99A04`
- Gold highlight: `#F2B91E`
- Background: `#F8FAFC`
- Main text: `#102A4C`
- ใช้ Lucide SVG icons ชุดเดียวตลอดระบบ
- การ์ดพื้นขาว เส้นขอบอุ่นบาง เงาเบา และมุมโค้ง 10–14px
- ตัวอักษรไทยอ่านง่าย ใช้ฟอนต์เดิมของเว็บไซต์หรือ Noto Sans Thai เป็น fallback
- สีข้อความและสถานะผ่าน WCAG AA และไม่ใช้สีเป็นตัวสื่อความหมายเพียงอย่างเดียว

### Layout

- Desktop ตั้งแต่ 1024px: sidebar กรมท่าเต็มความสูง, top bar, content grid แบบ data-dense
- Tablet 768–1023px: ซ่อน sidebar และใช้ปุ่มแฮมเบอร์เกอร์ใน top bar เปิดเมนูเป็น Sheet จากซ้าย
- Mobile ต่ำกว่า 768px: ใช้ hamburger/Sheet เช่นเดียวกับ Tablet, KPI เป็น 2 คอลัมน์ และรายการตารางเปลี่ยนเป็น card rows
- Sheet ต้องรองรับ keyboard, focus trap, Escape เพื่อปิด และแตะ overlay เพื่อปิด
- ไม่มี horizontal scroll ที่ 375px, 768px, 1024px และ 1440px

### Dashboard composition

1. หัวข้อและ primary actions: เพิ่มข่าว, อัปโหลดเอกสาร
2. KPI: ข่าว, เอกสาร, บริการ, บุคลากร, การเข้าชม
3. ข่าวล่าสุดพร้อมแก้ไข ดู และลบ
4. Quick actions สำหรับโมดูลหลัก
5. Activity timeline จาก `audit_logs`
6. เอกสารล่าสุดและบุคลากรล่าสุด
7. กราฟการเข้าชม 30 วันและลิงก์ไป Vercel Analytics

## 4. Information Architecture

| Route | หน้าที่ |
|---|---|
| `/admin` | Dashboard ภาพรวม |
| `/admin/news` | ข่าวและสถานะเผยแพร่ |
| `/admin/documents` | เอกสารและไฟล์ดาวน์โหลด |
| `/admin/services` | ระบบบริการและลำดับ |
| `/admin/gallery` | อัลบั้มและรูปกิจกรรม |
| `/admin/staff` | บุคลากร |
| `/admin/categories` | หมวดหมู่ข่าว เอกสาร และบริการแบบ tabs |
| `/admin/settings` | ตั้งค่าเว็บไซต์ |
| `/admin/users` | role และสถานะบัญชี |
| `/admin/activity` | ประวัติการเปลี่ยนแปลง |

หน้า create/edit ของแต่ละโมดูลคงเป็น route แยกเพื่อให้ URL ชัดเจน รองรับ refresh และตรวจสิทธิ์ฝั่ง server ได้

## 5. Module Behavior

### ข่าว

- เพิ่ม/แก้ไข title, slug, excerpt, content, cover, category และสถานะ
- สถานะ `draft`, `published`, `archived`
- ตั้ง/ยกเลิก featured และวันที่เผยแพร่
- เว็บสาธารณะแสดงเฉพาะ `published`

### เอกสาร

- อัปโหลดไฟล์พร้อม metadata ชื่อ ชนิด ขนาด หมวดหมู่ และคำอธิบาย
- จำกัดชนิดและขนาดไฟล์ทั้ง client และ server
- รองรับเผยแพร่/ซ่อน และนับยอดดาวน์โหลด

### บริการ

- เพิ่มชื่อ คำอธิบาย icon URL หมวดหมู่ สถานะ ลิงก์ภายนอก และลำดับ
- สถานะ `active`, `maintenance`, `inactive`

### ภาพกิจกรรม

- CRUD อัลบั้ม ภาพปก รายละเอียด วันที่ และสถานะเผยแพร่
- เพิ่ม/ลบรูป แก้ caption และ reorder ภาพในอัลบั้ม

### บุคลากร

- CRUD ชื่อ ตำแหน่ง ฝ่าย หน้าที่ โทรศัพท์ อีเมล รูป สถานะ และลำดับ

### หมวดหมู่

- CRUD แยกสามกลุ่มในหน้าเดียว: news, documents, services
- ป้องกัน slug ซ้ำ แสดงจำนวนรายการที่ใช้งาน และเตือนก่อนลบหมวดที่ยังถูกอ้างอิง

### ตั้งค่าเว็บไซต์

- ชื่อเว็บไซต์ ชื่อโรงเรียน โลโก้ สี ที่อยู่ โทรศัพท์ อีเมล Facebook แผนที่ และเวลาทำการ
- เมื่อบันทึกให้ revalidate หน้า public ทั้งหมดที่ใช้ settings

### ผู้ใช้งาน

- แสดง profile, email, role, สถานะ และวันที่สร้าง
- ปรับ `super_admin`, `admin`, `editor`, `viewer` ตามสิทธิ์
- เปิด/ปิดบัญชี โดยห้าม super admin ปิดบัญชีตัวเอง
- การสร้างบัญชีทำใน Supabase Dashboard เท่านั้น

## 6. Data Flow

```text
Admin UI
  -> Server Action + Zod validation
  -> authorization guard
  -> Supabase Postgres / Storage under RLS
  -> audit trigger
  -> revalidatePath(admin route + affected public route)
  -> refreshed Admin and public website
```

- Queries ใช้ Server Components เป็นหลัก
- Mutations ใช้ Server Actions ไม่สร้าง API route โดยไม่จำเป็น
- Upload ใช้ Supabase Storage buckets เดิมและ storage policies เดิม
- `SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะ server-only integrations ที่จำเป็น และไม่ถูก import เข้า Client Component

## 7. Database Changes

### ใช้ตารางเดิม

- `profiles`
- `news`, `news_categories`
- `documents`, `document_categories`
- `services`, `service_categories`
- `gallery_albums`, `gallery_images`
- `staff`
- `site_settings`
- `audit_logs`

### Migration ใหม่

1. เพิ่ม generic audit triggers ให้ตาราง content บันทึก `INSERT`, `UPDATE`, `DELETE`, record id และ before/after JSON
2. เพิ่ม index สำหรับรายการล่าสุด สถานะ หมวดหมู่ และ `audit_logs.created_at`
3. เพิ่มตาราง `analytics_daily` สำหรับ page views แบบ aggregate:
   - `date`
   - `path`
   - `page_views`
   - `source` (`vercel_drain` หรือ `first_party`)
   - unique key `(date, path, source)`
4. RLS ของ analytics: ไม่มี public read/write; admin อ่านผ่าน server; ingestion เขียนผ่าน server-only client

ไม่เก็บ raw IP, cookie id, user-agent เต็ม หรือ identifier ที่ย้อนกลับไปหาบุคคลได้ใน `analytics_daily`

## 8. Analytics Design

- ติดตั้ง `@vercel/analytics` ใน public root layout เพื่อเก็บ Vercel Web Analytics จริง
- Dashboard แสดง page views รายวันและเส้นทางยอดนิยมจาก `analytics_daily`
- ถ้า Vercel plan รองรับ Web Analytics Drain:
  - ส่ง event เข้า signed server endpoint
  - ตรวจลายเซ็นก่อนรับข้อมูล
  - aggregate เฉพาะวันที่และ path แล้วบันทึก Supabase
- ถ้า plan ไม่รองรับ Drain:
  - ใช้ first-party server endpoint เพิ่ม aggregate page views โดยไม่ใช้ cookie
  - แสดงข้อความกำกับว่า unique visitors และข้อมูลเชิงลึกดูจาก Vercel Analytics
- ห้ามใส่ Vercel access token ใน browser หรือ public environment variable

## 9. Audit Design

- Database trigger เป็นแหล่ง audit หลักเพื่อครอบคลุมทุก mutation
- เก็บ user id จาก authenticated context เมื่อมี
- UI แสดงผู้ทำรายการ action, module, record, เวลา และ summary
- รายละเอียด before/after เปิดใน dialog เฉพาะ super admin/admin
- Audit log เป็น append-only จาก UI; ไม่มีปุ่มแก้ไขหรือลบ

## 10. Authorization

| ความสามารถ | super_admin | admin | editor | viewer |
|---|:---:|:---:|:---:|:---:|
| ดู Dashboard | ✓ | ✓ | ✓ | ✓ |
| เพิ่ม/แก้ข่าวและเอกสาร | ✓ | ✓ | ✓ | – |
| ลบข่าวและเอกสาร | ✓ | ✓ | – | – |
| จัดการบริการ บุคลากร หมวดหมู่ และ settings | ✓ | ✓ | – | – |
| จัดการ role/status ผู้ใช้ | ✓ | – | – | – |
| ดู audit summary | ✓ | ✓ | ✓ | ✓ |
| ดู before/after audit details | ✓ | ✓ | – | – |

ทุก Server Action ต้องเรียก authorization guard และไม่พึ่งการซ่อนปุ่มใน UI เพียงอย่างเดียว

## 11. Validation & Error Handling

- Zod schema ใช้ร่วมระหว่าง form และ action
- Field errors แสดงใกล้ input; action errors แสดง toast และไม่ล้างข้อมูลใน form
- ปุ่ม submit disabled ขณะ pending และป้องกัน duplicate submission
- การลบใช้ confirm dialog พร้อมอธิบายผลกระทบ
- ตรวจ conflict เช่น slug ซ้ำ หรือหมวดหมู่ที่ยังถูกใช้งาน แล้วคืนข้อความภาษาไทยที่ทำตามได้
- มี loading, skeleton, empty และ error states ทุกหน้ารายการ
- Server logs ไม่พิมพ์ token, key, password หรือ payload ส่วนบุคคล

## 12. PDPA & Privacy

- Analytics ใช้ข้อมูลเท่าที่จำเป็นและ aggregate ก่อนเก็บ
- ไม่เก็บ raw IP, persistent device id หรือข้อมูลละเอียดที่ไม่จำเป็นใน Supabase
- เปิดเผย Vercel/Supabase เป็นผู้ประมวลผลข้อมูลใน privacy notice ของเว็บไซต์
- ระบุวัตถุประสงค์ ระยะเวลาเก็บ ผู้รับข้อมูล การส่งข้อมูลข้ามประเทศ และสิทธิ์ตามมาตรา 23
- ถ้ามี analytics cookie หรือ identifier ในอนาคต ต้องขอ consent แบบ opt-in และมีปุ่มยอมรับ/ปฏิเสธน้ำหนักเท่ากัน
- Audit logs จำกัดสิทธิ์และกำหนด retention ตามนโยบายองค์กร

## 13. Accessibility & Responsive UX

- touch target อย่างน้อย 44x44px
- visible focus ring และ logical tab order
- icon-only buttons มี `aria-label`
- ตารางมี header semantics; mobile card rows ยังรักษาชื่อ field
- status มีทั้งสีและข้อความ
- animation 150–300ms และเคารพ `prefers-reduced-motion`
- รูปใช้ `next/image`, ระบุขนาดพื้นที่ล่วงหน้า และมี alt text

## 14. Testing

### Unit

- permissions matrix
- validation schemas
- payload normalization และ slug generation

### Integration

- Server Actions ทุกโมดูล: success, validation failure, permission denied และ database conflict
- Audit trigger บันทึก insert/update/delete ถูก record และ user
- Analytics ingestion ปฏิเสธ signature ผิดและ aggregate ถูกต้อง

### End-to-end / smoke

- Login และ admin guard
- CRUD ข่าว เอกสาร บริการ บุคลากร และหมวดหมู่
- Upload ไฟล์และรูป
- Publish/unpublish แล้วเว็บไซต์สาธารณะเปลี่ยนตาม
- Tablet/Mobile hamburger Sheet
- Viewer/editor/admin/super admin เห็นและทำได้ตาม role

### Quality gates

- `npm run lint`
- TypeScript/production build
- responsive checks: 375, 768, 1024, 1440px
- accessibility keyboard/focus/contrast check
- Vercel Preview smoke test ก่อน Production

## 15. Deployment Plan

1. สร้าง migration ใหม่และ apply ที่ Supabase
2. Deploy code เป็น Vercel Preview
3. ทดสอบ migration, CRUD, Storage, RLS, audit และ public sync
4. เปิด Vercel Web Analytics และ Analytics Drain ถ้า plan รองรับ
5. ตั้ง environment variables แบบ server-only ที่จำเป็น
6. Promote Preview เดิมเป็น Production
7. ตรวจ runtime logs, HTTP 500, admin redirect และ rollback readiness

## 16. Acceptance Criteria

- Dashboard ใช้ visual system ตามภาพอ้างอิง
- Desktop sidebar และ Tablet/Mobile hamburger Sheet ทำงานครบ
- ผู้ดูแลเพิ่ม แก้ ลบ และเผยแพร่ข้อมูลทุกโมดูลตามสิทธิ์ได้
- หมวดหมู่ทั้งสามกลุ่มจัดการได้
- ข้อมูลที่เผยแพร่สะท้อนบน public website หลังบันทึก
- Upload มี validation และ Storage policy ป้องกันการเขียนที่ไม่ได้รับอนุญาต
- Audit log แสดงการเปลี่ยนแปลงจริงและแก้ไขจาก UI ไม่ได้
- Vercel Analytics ทำงาน; Dashboard แสดง page views จริงโดยไม่สร้างตัวเลขจำลอง
- ไม่มี secret ใน Git หรือ client bundle
- Production build ผ่านและหน้า public/admin สำคัญผ่าน smoke test
