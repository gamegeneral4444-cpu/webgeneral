# เว็บไซต์กลุ่มบริหารงานทั่วไป

เว็บไซต์องค์กรระดับโรงเรียน (School Enterprise Portal + Admin Dashboard + CMS)
สร้างด้วย **Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + shadcn/ui** ตามชุดเอกสารออกแบบ

---

## สารบัญ
1. [ฟีเจอร์](#ฟีเจอร์)
2. [เทคโนโลยี](#เทคโนโลยี)
3. [เริ่มต้นใช้งาน (Local)](#เริ่มต้นใช้งาน-local)
4. [ตั้งค่า Supabase (5 ขั้นตอน)](#ตั้งค่า-supabase-5-ขั้นตอน)
5. [Deploy ขึ้น Vercel](#deploy-ขึ้น-vercel)
6. [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
7. [บทบาทผู้ใช้ (Roles)](#บทบาทผู้ใช้-roles)

---

## ฟีเจอร์

**Public Website**
- หน้าแรก (Hero, บริการด่วน, ข่าว, เอกสาร, ภาพกิจกรรม, บุคลากร, ติดต่อ)
- ข่าวประชาสัมพันธ์ (ค้นหา + กรองหมวดหมู่) + หน้ารายละเอียด
- ระบบบริการออนไลน์, ดาวน์โหลดเอกสาร (นับยอดดาวน์โหลด)
- ภาพกิจกรรม (อัลบั้ม + Lightbox), บุคลากร, เกี่ยวกับเรา, ติดต่อเรา
- SEO (metadata, Open Graph, sitemap, robots), รองรับมือถือ 100%, โทนเหลืองทอง

**Admin Dashboard** (`/admin`)
- Login (Supabase Auth) + ป้องกันเส้นทางด้วย Proxy + Role guard
- แดชบอร์ดสรุปสถิติ
- CRUD: ข่าว / เอกสาร / บริการ / บุคลากร / ภาพกิจกรรม
- ตั้งค่าเว็บไซต์ + จัดการผู้ใช้งาน (เฉพาะ Super Admin)
- อัปโหลดไฟล์เข้า Supabase Storage (จำกัดชนิด/ขนาดไฟล์), Toast, Confirm Dialog

---

## เทคโนโลยี
| ด้าน | เครื่องมือ |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS v4 + shadcn/ui + Lucide |
| Backend | Server Actions |
| Database/Auth/Storage | Supabase (PostgreSQL + RLS) |
| Validation | Zod + React Hook Form |
| Hosting | Vercel |

---

## เริ่มต้นใช้งาน (Local)

```bash
npm install
cp .env.example .env.local   # แล้วแก้ค่าให้ครบ
npm run dev
```

เปิด http://localhost:3000

> โปรเจกต์ตั้งค่า `.env.local` เป็น **placeholder** ไว้แล้ว จึง `npm run build` / `npm run dev` ได้ทันที
> หน้าเว็บจะแสดง empty state จนกว่าจะเชื่อม Supabase จริง

---

## ตั้งค่า Supabase (5 ขั้นตอน)

1. **สร้างโปรเจกต์** ที่ https://supabase.com → คัดลอกค่าจาก *Project Settings → API*:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
   นำไปใส่ใน `.env.local`

2. **รัน Migration** ที่ *SQL Editor* โดยรันไฟล์ตามลำดับ:
   ```
   supabase/migrations/0001_init_schema.sql
   supabase/migrations/0002_rls_policies.sql
   supabase/migrations/0003_storage.sql
   supabase/migrations/0004_admin_cms_audit.sql
   supabase/migrations/0005_analytics.sql
   supabase/seed.sql           ← ข้อมูลตั้งต้น (ไม่บังคับ)
   ```
   (หรือใช้ Supabase CLI: `supabase db push` แล้ว `supabase db execute -f supabase/seed.sql`)

3. **สร้าง Storage Buckets** — ไฟล์ `0003_storage.sql` สร้างให้แล้ว (news-covers, document-files,
   gallery-images, staff-images, site-assets เป็น public read) ตรวจได้ที่เมนู *Storage*

4. **สร้างผู้ดูแลคนแรก** ที่ *Authentication → Users → Add user* (กรอกอีเมล/รหัสผ่าน, ติ๊ก Auto Confirm)
   ระบบจะสร้างโปรไฟล์อัตโนมัติ (role เริ่มต้น = viewer)

5. **เลื่อนเป็น Super Admin** ที่ *SQL Editor*:
   ```sql
   update public.profiles set role = 'super_admin' where email = 'อีเมลของคุณ';
   ```
   จากนั้น login ที่ `/login` ได้เลย

---

## Deploy ขึ้น Vercel

1. push โค้ดขึ้น GitHub
2. ที่ Vercel → New Project → import repo
3. ใส่ Environment Variables (ค่าเดียวกับ `.env.local` แต่ `NEXT_PUBLIC_SITE_URL` ใช้โดเมนจริง)
4. Deploy — Vercel ตรวจ Next.js ให้อัตโนมัติ
5. ตั้งค่าโดเมน (ถ้ามี) ที่ *Settings → Domains*

> **ความปลอดภัย:** `SUPABASE_SERVICE_ROLE_KEY` ใช้เฉพาะฝั่ง server เท่านั้น (ไม่มีคำนำหน้า `NEXT_PUBLIC_`)

---

## โครงสร้างโปรเจกต์

```
app/
  (public)/      หน้าเว็บสาธารณะ + layout (header/footer)
  admin/         หลังบ้าน + layout (sidebar/topbar) + guard
  login/         หน้าเข้าสู่ระบบ
components/
  public/  admin/  ui/ (shadcn)  brand-icons, lucide-icon
lib/
  supabase/  (client / server / proxy)
  actions/   (server actions: auth, news, documents, services, staff, gallery, settings, users)
  data.ts  admin-data.ts  validations.ts  permissions.ts  format.ts  slug.ts  constants.ts
types/         TypeScript types
supabase/      migrations/ + seed.sql
proxy.ts       Next.js 16 Proxy (refresh session + ป้องกัน /admin)
```

---

## บทบาทผู้ใช้ (Roles)
| สิทธิ์ | super_admin | admin | editor | viewer |
|---|:---:|:---:|:---:|:---:|
| ดูแดชบอร์ด | ✅ | ✅ | ✅ | ✅ |
| เพิ่ม/แก้ไข ข่าว-เอกสาร | ✅ | ✅ | ✅ | ❌ |
| ลบข่าว-เอกสาร | ✅ | ✅ | ❌ | ❌ |
| จัดการบริการ/บุคลากร/ตั้งค่า | ✅ | ✅ | ❌ | ❌ |
| จัดการผู้ใช้งาน | ✅ | ❌ | ❌ | ❌ |

---

## การตรวจสอบก่อน deploy

```powershell
npm install
npm test
npm run lint
npm run build
```

## Supabase migrations

ใช้ migration ตามลำดับใน `supabase/migrations` โดยเฉพาะ:

1. `0004_admin_cms_audit.sql` เพิ่ม audit trigger, activity summary และ transaction เรียงรูป
2. `0005_analytics.sql` เพิ่มสถิติ page views แบบรวมรายวัน

โปรเจกต์นี้ยังไม่ได้เก็บรหัสผ่านฐานข้อมูลหรือ Supabase access token ใน Git หาก CLI ยังไม่ได้ link ให้นำ SQL ทั้งสองไฟล์ไปรันใน Supabase SQL Editor ตามลำดับ แล้วรัน assertion ใน `supabase/tests` เพื่อตรวจสอบ

## Environment variables

ตั้งค่าทั้ง Preview และ Production ใน Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_VERCEL_PROJECT_URL` (optional)

ห้าม prefix service role key ด้วย `NEXT_PUBLIC_` และห้าม commit `.env.local`

## Analytics

เปิด Web Analytics ใน Vercel Project Settings ตัว `<Analytics />` ถูกติดตั้งที่ root layout แล้ว Dashboard ใช้ข้อมูลรวมรายวันจาก Supabase และไม่เก็บ raw IP, cookie ID, visitor ID หรือ full user agent

หลัง deploy ให้เปิดหน้าสาธารณะอย่างน้อยสองหน้า ตรวจว่า `POST /api/analytics/page-view` ตอบ `204` และดูว่า `analytics_daily` เพิ่มขึ้น จากนั้นตรวจกราฟใน `/admin`

## Smoke test หลัง deploy

- `/`, `/news`, `/downloads`, `/services`, `/gallery`, `/privacy`, `/login` ตอบสำเร็จ
- ผู้ใช้ที่ไม่ login เข้า `/admin` แล้วถูกส่งไป `/login`
- role แต่ละระดับเห็นเมนูและ action ตามสิทธิ์
- เพิ่ม/แก้ไขข้อมูลทดสอบหนึ่งรายการแล้วเห็น activity log
- ตรวจ Vercel Runtime Logs ว่าไม่มี 5xx ใหม่
