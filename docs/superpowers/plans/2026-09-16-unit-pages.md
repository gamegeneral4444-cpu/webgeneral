# หน้างานในฝ่าย (Unit Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มหน้ารวม 14 งานของฝ่ายบริหารงานทั่วไป และหน้าย่อยรายงาน ที่เจ้าหน้าที่ลงงาน/อัปเดตความคืบหน้าได้ผ่านหลังบ้าน โดยแยกจากระบบข่าวประชาสัมพันธ์

**Architecture:** รายชื่องาน 14 งานเป็นค่าคงที่ในโค้ด (`lib/units.ts`) เพราะโครงสร้างฝ่ายไม่เปลี่ยนบ่อย และต้องผูกกับไอคอน/ลำดับ/ชื่อผู้รับผิดชอบที่ฐานข้อมูลไม่มีช่องเก็บ ส่วน "โพสต์งาน" เก็บในตารางใหม่ `unit_posts` อ้างอิงงานด้วยคอลัมน์ `unit_slug` (text) จึงไม่ต้องมีตาราง units และไม่ต้องมีหน้า CRUD สำหรับตัวงานเอง หน้าแอดมินชุดใหม่แยกจากข่าว โพสต์งานจะไม่ไปโผล่ในหน้าข่าวรวม

**Tech Stack:** Next.js 16 App Router · Supabase (PostgreSQL + RLS) · Server Actions · Zod · Tailwind v4 · shadcn/ui · vitest

---

## ข้อควรรู้ก่อนเริ่ม

**การรัน migration ต้องทำบน Supabase จริง** เครื่อง dev ไม่มี key (`.env.local` เป็น placeholder และ Vercel ตั้ง env เป็น Sensitive ดึงกลับไม่ได้) ดังนั้น Task 2 ต้องให้เจ้าของโปรเจกต์รัน SQL ใน Supabase SQL Editor เอง แล้วงานที่เหลือจึงทดสอบกับข้อมูลจริงได้

**ลำดับที่ปลอดภัย:** Task 1 → 2 (รอผู้ใช้รัน SQL) → 3–5 (แกนข้อมูล) → 6–8 (หน้าเว็บสาธารณะ) → 9–11 (หลังบ้าน) → 12–13 (เก็บกวาดของเดิม) → 14 (ตรวจรวม)

## File Structure

| ไฟล์ | หน้าที่ |
|---|---|
| `lib/units.ts` (สร้างแล้วบางส่วน) | รายชื่อ 14 งาน + slug + ไอคอน + ผู้รับผิดชอบ — แหล่งข้อมูลชุดเดียว |
| `lib/units.test.ts` | ทดสอบว่า slug ไม่ซ้ำและหาได้จริง |
| `supabase/migrations/0009_unit_posts.sql` | ตาราง `unit_posts` + index + RLS |
| `types/database.ts` | เพิ่ม type `UnitPost` |
| `lib/validations.ts` | เพิ่ม `unitPostSchema` |
| `lib/data.ts` | เพิ่ม `getUnitPosts()` · `getUnitPost()` |
| `lib/actions/unit-posts.ts` | create / update / delete |
| `app/(public)/units/page.tsx` | หน้ารวม 14 งาน |
| `app/(public)/units/[slug]/page.tsx` | หน้าย่อยของแต่ละงาน |
| `app/admin/unit-posts/page.tsx` | รายการโพสต์งานในหลังบ้าน |
| `app/admin/unit-posts/create/page.tsx` | หน้าเพิ่ม |
| `app/admin/unit-posts/[id]/edit/page.tsx` | หน้าแก้ไข |
| `app/admin/unit-posts/unit-post-form.tsx` | ฟอร์มใช้ร่วมกันสองหน้า |
| `lib/constants.ts` | เพิ่มเมนู "งานในฝ่าย" |
| `components/admin/admin-nav.ts` | เพิ่มเมนูหลังบ้าน |
| `app/(public)/about/page.tsx` | เลิกใช้ลิสต์ 8 รายการเดิม หันมาใช้ `UNITS` |
| `components/public/page-hero.tsx` | แก้สีเทา `#0f172a` เป็นกรมท่าของแบรนด์ |

---

### Task 1: รายชื่องาน 14 งานพร้อม slug

**Files:**
- Modify: `lib/units.ts`
- Test: `lib/units.test.ts`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

```ts
// lib/units.test.ts
import { describe, it, expect } from "vitest";
import { UNITS, findUnit } from "./units";

describe("UNITS", () => {
  it("มีครบ 14 งาน", () => {
    expect(UNITS).toHaveLength(14);
  });

  it("slug ไม่ซ้ำกัน", () => {
    const slugs = UNITS.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("slug เป็น a-z0-9- เท่านั้น", () => {
    for (const u of UNITS) expect(u.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("findUnit หาเจอด้วย slug", () => {
    expect(findUnit("building")?.label).toBe("งานอาคารสถานที่");
  });

  it("findUnit คืน undefined เมื่อไม่มี", () => {
    expect(findUnit("ไม่มีงานนี้")).toBeUndefined();
  });
});
```

- [ ] **Step 2: รันเทสให้เห็นว่าไม่ผ่าน**

Run: `npx vitest run lib/units.test.ts`
Expected: FAIL — `findUnit` ยังไม่มี และ `Unit` ยังไม่มีฟิลด์ `slug`

- [ ] **Step 3: เติม slug และ findUnit**

แทนที่ `lib/units.ts` ทั้งไฟล์ด้วย:

```ts
import {
  Building2, Projector, ClipboardList, ClipboardCheck, HandCoins,
  UtensilsCrossed, HeartPulse, ShieldCheck, Handshake, HeartHandshake,
  Users, Megaphone, Car, FileStack, type LucideIcon,
} from "lucide-react";

export type Unit = {
  /** ใช้เป็น URL `/units/<slug>` และเป็นค่าในคอลัมน์ unit_posts.unit_slug */
  slug: string;
  label: string;
  icon: LucideIcon;
  /** ชื่อผู้รับผิดชอบ เว้นว่างไว้ได้ หน้าเว็บจะขึ้นว่ายังไม่ได้ระบุ */
  owner?: string;
};

/**
 * งานในฝ่ายบริหารงานทั่วไป — แหล่งข้อมูลชุดเดียวของทั้งเว็บ
 * ใช้ทั้งหน้า /units, หน้าย่อย /units/[slug] และหัวข้อ "ขอบข่ายงาน" ในหน้า /about
 * slug ห้ามแก้หลังมีโพสต์แล้ว เพราะ unit_posts อ้างอิงด้วยค่านี้
 */
export const UNITS: Unit[] = [
  { slug: "building", label: "งานอาคารสถานที่", icon: Building2 },
  { slug: "av", label: "งานโสตทัศนูปกรณ์", icon: Projector },
  { slug: "plan-info", label: "งานแผนปฏิบัติการและสารสนเทศ", icon: ClipboardList },
  { slug: "supervision", label: "งานนิเทศ ติดตาม ประเมินผล และรายงานผล", icon: ClipboardCheck },
  { slug: "fundraising", label: "งานระดมทุนและทรัพยากร", icon: HandCoins },
  { slug: "nutrition", label: "งานโภชนาการ", icon: UtensilsCrossed },
  { slug: "health", label: "งานอนามัย", icon: HeartPulse },
  { slug: "security", label: "งานรักษาความปลอดภัย", icon: ShieldCheck },
  { slug: "community", label: "งานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์", icon: Handshake },
  { slug: "student-support", label: "งานระบบดูแลช่วยเหลือนักเรียน", icon: HeartHandshake },
  { slug: "student-affairs", label: "งานกิจการนักเรียน", icon: Users },
  { slug: "pr", label: "งานประชาสัมพันธ์และเผยแพร่", icon: Megaphone },
  { slug: "vehicle", label: "งานยานพาหนะ", icon: Car },
  { slug: "admin-office", label: "งานธุรการและสารบรรณ", icon: FileStack },
];

export function findUnit(slug: string): Unit | undefined {
  return UNITS.find((u) => u.slug === slug);
}
```

- [ ] **Step 4: รันเทสให้ผ่าน**

Run: `npx vitest run lib/units.test.ts`
Expected: PASS 5 เทส

- [ ] **Step 5: commit**

```bash
git add lib/units.ts lib/units.test.ts
git commit -m "feat: เพิ่มรายชื่องาน 14 งานของฝ่ายพร้อม slug"
```

---

### Task 2: ตาราง unit_posts + RLS

**Files:**
- Create: `supabase/migrations/0009_unit_posts.sql`

- [ ] **Step 1: เขียนไฟล์ migration**

```sql
-- 0009_unit_posts.sql — โพสต์งานของแต่ละงานในฝ่าย
-- แยกจากตาราง news โดยตั้งใจ โพสต์งานจะไม่ปนกับข่าวประชาสัมพันธ์

create table if not exists public.unit_posts (
  id          uuid primary key default gen_random_uuid(),
  unit_slug   text not null,
  title       text not null,
  body        text not null default '',
  attachment_url text,
  status      text not null default 'draft' check (status in ('draft','published')),
  posted_at   timestamptz,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists unit_posts_unit_slug_idx
  on public.unit_posts (unit_slug, posted_at desc);

create index if not exists unit_posts_status_idx
  on public.unit_posts (status);

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

-- อัปเดต updated_at อัตโนมัติ ใช้ฟังก์ชันเดิมที่ 0001 สร้างไว้
drop trigger if exists unit_posts_set_updated_at on public.unit_posts;
create trigger unit_posts_set_updated_at
  before update on public.unit_posts
  for each row execute function public.set_updated_at();
```

- [ ] **Step 2: ตรวจว่าฟังก์ชันที่อ้างถึงมีอยู่จริง**

Run: `grep -n "set_updated_at\|get_current_user_role" supabase/migrations/0001_init_schema.sql supabase/migrations/0002_rls_policies.sql | head`
Expected: เจอทั้ง `public.set_updated_at()` และ `public.get_current_user_role()`
ถ้าชื่อไม่ตรง ให้แก้ SQL ข้างบนให้ตรงกับของจริงก่อนส่งให้ผู้ใช้รัน

- [ ] **Step 3: ให้ผู้ใช้รัน SQL บน Supabase**

หยุดรอตรงนี้ แจ้งผู้ใช้ว่า: เปิด https://supabase.com/dashboard → project `jkorihzfcvqqmflbvqux` → SQL Editor → วางเนื้อไฟล์ `supabase/migrations/0009_unit_posts.sql` → Run
ยืนยันผลว่าไม่มี error ก่อนไปต่อ

- [ ] **Step 4: commit**

```bash
git add supabase/migrations/0009_unit_posts.sql
git commit -m "feat: migration ตาราง unit_posts พร้อม RLS"
```

---

### Task 3: type + validation schema

**Files:**
- Modify: `types/database.ts`
- Modify: `lib/validations.ts`
- Test: `lib/validations.test.ts`

- [ ] **Step 1: เขียนเทสที่ยังไม่ผ่าน**

เพิ่มท้าย `lib/validations.test.ts`:

```ts
import { unitPostSchema } from "./validations";

describe("unitPostSchema", () => {
  const ok = { unit_slug: "building", title: "ซ่อมหลังคาอาคาร 2", body: "เริ่ม 1 ต.ค.", status: "draft" as const };

  it("ผ่านเมื่อข้อมูลครบ", () => {
    expect(unitPostSchema.safeParse(ok).success).toBe(true);
  });

  it("ไม่ผ่านเมื่อไม่มีหัวข้อ", () => {
    expect(unitPostSchema.safeParse({ ...ok, title: "" }).success).toBe(false);
  });

  it("ไม่ผ่านเมื่อ unit_slug ไม่อยู่ในรายการงาน", () => {
    expect(unitPostSchema.safeParse({ ...ok, unit_slug: "ไม่มีงานนี้" }).success).toBe(false);
  });

  it("ไม่ผ่านเมื่อ status ไม่ใช่ draft/published", () => {
    expect(unitPostSchema.safeParse({ ...ok, status: "archived" }).success).toBe(false);
  });
});
```

- [ ] **Step 2: รันเทสให้เห็นว่าไม่ผ่าน**

Run: `npx vitest run lib/validations.test.ts`
Expected: FAIL — `unitPostSchema` is not exported

- [ ] **Step 3: เพิ่ม type**

เพิ่มท้าย `types/database.ts`:

```ts
export type UnitPostStatus = "draft" | "published";

export type UnitPost = {
  id: string;
  unit_slug: string;
  title: string;
  body: string;
  attachment_url: string | null;
  status: UnitPostStatus;
  posted_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 4: เพิ่ม schema**

เพิ่มท้าย `lib/validations.ts` (ต้อง import UNITS ไว้บนสุดของไฟล์):

```ts
import { UNITS } from "@/lib/units";

export const unitPostSchema = z.object({
  unit_slug: z.string().refine((s) => UNITS.some((u) => u.slug === s), "ไม่พบงานที่เลือก"),
  title: z.string().min(1, "กรุณากรอกหัวข้อ").max(255),
  body: z.string().max(20000).optional().or(z.literal("")),
  attachment_url: z.string().url("ลิงก์ไฟล์แนบไม่ถูกต้อง").optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  posted_at: z.string().optional().or(z.literal("")),
});
export type UnitPostInput = z.infer<typeof unitPostSchema>;
```

- [ ] **Step 5: รันเทสให้ผ่าน**

Run: `npx vitest run lib/validations.test.ts`
Expected: PASS ทั้งไฟล์

- [ ] **Step 6: commit**

```bash
git add types/database.ts lib/validations.ts lib/validations.test.ts
git commit -m "feat: type และ schema ของโพสต์งาน"
```

---

### Task 4: ชั้นดึงข้อมูล

**Files:**
- Modify: `lib/data.ts`

- [ ] **Step 1: เพิ่มฟังก์ชันดึงข้อมูล**

เพิ่มท้าย `lib/data.ts` (ดูรูปแบบ `getPublishedNews` ในไฟล์เดียวกันแล้วทำตามให้เหมือน รวมถึงวิธี handle error เมื่อต่อ Supabase ไม่ได้):

```ts
import type { UnitPost } from "@/types/database";

/** โพสต์งานของงานหนึ่ง เรียงใหม่ก่อน */
export async function getUnitPosts(opts?: {
  unitSlug?: string;
  limit?: number;
  includeDrafts?: boolean;
}): Promise<UnitPost[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from("unit_posts").select("*");
    if (opts?.unitSlug) query = query.eq("unit_slug", opts.unitSlug);
    if (!opts?.includeDrafts) query = query.eq("status", "published");
    query = query.order("posted_at", { ascending: false, nullsFirst: false })
                 .order("created_at", { ascending: false });
    if (opts?.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as UnitPost[];
  } catch {
    return [];
  }
}

/** นับจำนวนโพสต์ที่เผยแพร่แล้วของทุกงาน คืนเป็น map slug -> จำนวน */
export async function getUnitPostCounts(): Promise<Record<string, number>> {
  const posts = await getUnitPosts();
  const out: Record<string, number> = {};
  for (const p of posts) out[p.unit_slug] = (out[p.unit_slug] ?? 0) + 1;
  return out;
}

export async function getUnitPost(id: string): Promise<UnitPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("unit_posts").select("*").eq("id", id).single();
    if (error) return null;
    return data as UnitPost;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: ตรวจว่า build ผ่าน**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 3: commit**

```bash
git add lib/data.ts
git commit -m "feat: ฟังก์ชันดึงโพสต์งาน"
```

---

### Task 5: server actions

**Files:**
- Create: `lib/actions/unit-posts.ts`

- [ ] **Step 1: เขียน action**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { unitPostSchema } from "@/lib/validations";
import { authorize, nullifyEmpty, type ActionResult } from "@/lib/actions/helpers";

function parse(formData: FormData) {
  return unitPostSchema.safeParse({
    unit_slug: formData.get("unit_slug"),
    title: formData.get("title"),
    body: formData.get("body") ?? "",
    attachment_url: formData.get("attachment_url") ?? "",
    status: formData.get("status"),
    posted_at: formData.get("posted_at") ?? "",
  });
}

function revalidate(unitSlug: string) {
  revalidatePath("/admin/unit-posts");
  revalidatePath("/units");
  revalidatePath(`/units/${unitSlug}`);
}

export async function createUnitPost(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, userId } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = nullifyEmpty(parsed.data);
    if (payload.status === "published" && !payload.posted_at) {
      payload.posted_at = new Date().toISOString();
    }

    const { error } = await supabase.from("unit_posts").insert({ ...payload, created_by: userId });
    if (error) return { ok: false, error: error.message };

    revalidate(parsed.data.unit_slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function updateUnitPost(id: string, formData: FormData): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("write");
    const parsed = parse(formData);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

    const payload = nullifyEmpty(parsed.data);
    if (payload.status === "published" && !payload.posted_at) {
      payload.posted_at = new Date().toISOString();
    }

    const { error } = await supabase.from("unit_posts").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidate(parsed.data.unit_slug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteUnitPost(id: string, unitSlug: string): Promise<ActionResult> {
  try {
    const { supabase } = await authorize("delete");
    const { error } = await supabase.from("unit_posts").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidate(unitSlug);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 3: commit**

```bash
git add lib/actions/unit-posts.ts
git commit -m "feat: server actions ของโพสต์งาน"
```

---

### Task 6: หน้ารวม /units

**Files:**
- Create: `app/(public)/units/page.tsx`

- [ ] **Step 1: เขียนหน้า**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { UNITS } from "@/lib/units";
import { getUnitPostCounts } from "@/lib/data";

export const metadata: Metadata = { title: "งานในฝ่าย" };
export const revalidate = 300;

export default async function UnitsPage() {
  const counts = await getUnitPostCounts();

  return (
    <>
      <PageHero
        title="งานในฝ่ายบริหารงานทั่วไป"
        subtitle="โครงสร้างงานย่อยทั้ง 14 งาน พร้อมความคืบหน้าล่าสุดของแต่ละงาน"
        crumbs={[{ label: "งานในฝ่าย" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UNITS.map((u) => {
            const count = counts[u.slug] ?? 0;
            return (
              <Link
                key={u.slug}
                href={`/units/${u.slug}`}
                className="group flex flex-col gap-3 rounded-xl border border-t-2 border-t-gold bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <u.icon className="size-6" aria-hidden />
                </span>
                <span className="font-medium text-foreground group-hover:text-primary">{u.label}</span>
                <span className="text-sm text-muted-foreground">
                  ผู้รับผิดชอบ : {u.owner || "ยังไม่ได้ระบุ"}
                </span>
                <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                  {count > 0 ? `${count} รายการ` : "ยังไม่มีรายการ"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: ตรวจ build**

Run: `npm run build`
Expected: เห็น route `/units` ในผลลัพธ์

- [ ] **Step 3: commit**

```bash
git add "app/(public)/units/page.tsx"
git commit -m "feat: หน้ารวมงานในฝ่าย"
```

---

### Task 7: หน้าย่อย /units/[slug]

**Files:**
- Create: `app/(public)/units/[slug]/page.tsx`

- [ ] **Step 1: เขียนหน้า**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Paperclip } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { EmptyState } from "@/components/public/section";
import { UNITS, findUnit } from "@/lib/units";
import { getUnitPosts } from "@/lib/data";
import { formatThaiDate } from "@/lib/format";

export const revalidate = 300;

export function generateStaticParams() {
  return UNITS.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const unit = findUnit(slug);
  return { title: unit?.label ?? "ไม่พบงาน" };
}

export default async function UnitDetailPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = findUnit(slug);
  if (!unit) notFound();

  const posts = await getUnitPosts({ unitSlug: slug });

  return (
    <>
      <PageHero
        title={unit.label}
        subtitle={`ผู้รับผิดชอบ : ${unit.owner || "ยังไม่ได้ระบุ"}`}
        crumbs={[{ label: "งานในฝ่าย", href: "/units" }, { label: unit.label }]}
      />

      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10">
            <unit.icon className="size-6" aria-hidden />
          </span>
          <div>
            <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
            <h2 className="text-xl font-bold text-foreground">ความคืบหน้าและผลการดำเนินงาน</h2>
          </div>
        </div>

        {posts.length ? (
          <ol className="space-y-4">
            {posts.map((p) => (
              <li key={p.id} className="rounded-xl border border-l-4 border-l-gold bg-card p-5 shadow-sm">
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                {p.posted_at && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" aria-hidden />
                    {formatThaiDate(p.posted_at)}
                  </p>
                )}
                {p.body && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{p.body}</p>
                )}
                {p.attachment_url && (
                  <a
                    href={p.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Paperclip className="size-4" aria-hidden /> ไฟล์แนบ
                  </a>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="ยังไม่มีรายการของงานนี้"
            description="เมื่อผู้รับผิดชอบลงงานหรืออัปเดตความคืบหน้าแล้ว จะแสดงที่นี่"
          />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: ตรวจลายเซ็นของ formatThaiDate**

Run: `sed -n '1,24p' lib/format.ts`
ยืนยันว่ารับ string ได้และพารามิเตอร์ตัวที่สองเป็น optional ถ้าไม่ใช่ ให้ปรับการเรียกใช้ในหน้าให้ตรง

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: เห็น route `/units/[slug]`

- [ ] **Step 4: commit**

```bash
git add "app/(public)/units/[slug]/page.tsx"
git commit -m "feat: หน้าย่อยของแต่ละงาน"
```

---

### Task 8: เมนูหน้าเว็บ

**Files:**
- Modify: `lib/constants.ts:19-28`

- [ ] **Step 1: เพิ่มเมนู**

ใน `PUBLIC_NAV` แทรกรายการ "งานในฝ่าย" ต่อจาก "เกี่ยวกับเรา":

```ts
export const PUBLIC_NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/units", label: "งานในฝ่าย" },
  { href: "/news", label: "ข่าวประชาสัมพันธ์" },
  { href: "/services", label: "ระบบบริการ" },
  { href: "/downloads", label: "ดาวน์โหลด" },
  { href: "/gallery", label: "ภาพกิจกรรม" },
  { href: "/staff", label: "บุคลากร" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;
```

- [ ] **Step 2: ตรวจว่าเมนูไม่ล้นบนจอ 1440px**

Run: `npm run dev` แล้วเปิด http://localhost:3000
Expected: เมนู 9 รายการยังอยู่บรรทัดเดียว ไม่ตกบรรทัด ถ้าล้นให้ลดขนาดตัวอักษรเมนูจาก `text-sm` เป็น `text-[13px]` ใน `components/public/site-header.tsx`

- [ ] **Step 3: commit**

```bash
git add lib/constants.ts
git commit -m "feat: เพิ่มเมนูงานในฝ่าย"
```

---

### Task 9: หน้ารายการหลังบ้าน

**Files:**
- Create: `app/admin/unit-posts/page.tsx`

- [ ] **Step 1: อ่านแม่แบบ**

Run: `cat app/admin/services/page.tsx`
ทำตามโครงเดียวกัน (หัวข้อ + ปุ่มเพิ่ม + ตาราง + ปุ่มแก้ไข/ลบ) เพื่อให้หน้าตาเข้าชุดกับหลังบ้านเดิม

- [ ] **Step 2: เขียนหน้ารายการ**

```tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { getUnitPosts } from "@/lib/data";
import { UNITS } from "@/lib/units";

export const metadata = { title: "งานในฝ่าย" };

const UNIT_LABEL = Object.fromEntries(UNITS.map((u) => [u.slug, u.label]));

export default async function AdminUnitPostsPage() {
  const posts = await getUnitPosts({ includeDrafts: true });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--admin-ink)]">งานในฝ่าย</h1>
          <p className="text-sm text-muted-foreground">ลงงานและอัปเดตความคืบหน้าของแต่ละงาน</p>
        </div>
        <Link
          href="/admin/unit-posts/create"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden /> เพิ่มรายการ
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)] bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3">หัวข้อ</th>
              <th className="px-4 py-3">งาน</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3">วันที่</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  ยังไม่มีรายการ
                </td>
              </tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-t hover:bg-accent/40">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{UNIT_LABEL[p.unit_slug] ?? p.unit_slug}</td>
                <td className="px-4 py-3">
                  <span className={p.status === "published"
                    ? "rounded-full bg-soft-gold px-2 py-0.5 text-xs text-gold-dark"
                    : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"}>
                    {p.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.posted_at ? new Date(p.posted_at).toLocaleDateString("th-TH") : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/unit-posts/${p.id}/edit`} className="text-primary hover:underline">
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: เห็น route `/admin/unit-posts`

- [ ] **Step 4: commit**

```bash
git add app/admin/unit-posts/page.tsx
git commit -m "feat: หน้ารายการโพสต์งานในหลังบ้าน"
```

---

### Task 10: ฟอร์มเพิ่ม/แก้ไข

**Files:**
- Create: `app/admin/unit-posts/unit-post-form.tsx`
- Create: `app/admin/unit-posts/create/page.tsx`
- Create: `app/admin/unit-posts/[id]/edit/page.tsx`

- [ ] **Step 1: อ่านแม่แบบฟอร์ม**

Run: `cat app/admin/services/service-form.tsx`
ทำตามรูปแบบเดียวกันทั้งการใช้ `useActionState`/`useTransition`, การแสดง error, และปุ่มบันทึก — อย่าคิดรูปแบบใหม่เอง

- [ ] **Step 2: เขียนฟอร์มร่วม**

ใช้รูปแบบเดียวกับ `service-form.tsx` คือ react-hook-form + zodResolver + คอมโพเนนต์ shadcn
(`Input`, `Textarea`, `Label`, `Select`, `Button`) ไม่ใช้ element ดิบ เพื่อให้หน้าตาและ
พฤติกรรม error ตรงกับหน้าหลังบ้านอื่น

```tsx
"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { unitPostSchema } from "@/lib/validations";
import { UNITS } from "@/lib/units";
import { createUnitPost, updateUnitPost } from "@/lib/actions/unit-posts";
import type { UnitPost } from "@/types/database";

type FormValues = z.input<typeof unitPostSchema>;

function toFormData(v: FormValues): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function UnitPostForm({ initial }: { initial?: UnitPost }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register, handleSubmit, setValue, watch, formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(unitPostSchema),
    defaultValues: {
      unit_slug: initial?.unit_slug ?? UNITS[0].slug,
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      attachment_url: initial?.attachment_url ?? "",
      status: initial?.status ?? "draft",
      posted_at: initial?.posted_at ? initial.posted_at.slice(0, 10) : "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = toFormData(values);
      const res = initial ? await updateUnitPost(initial.id, fd) : await createUnitPost(fd);
      if (!res.ok) {
        toast.error(res.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      toast.success("บันทึกแล้ว");
      router.push("/admin/unit-posts");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5 rounded-xl border border-[var(--admin-border)] bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="unit_slug">งาน</Label>
        <Select value={watch("unit_slug")} onValueChange={(v) => setValue("unit_slug", v)}>
          <SelectTrigger id="unit_slug"><SelectValue /></SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => <SelectItem key={u.slug} value={u.slug}>{u.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.unit_slug && <p className="text-sm text-destructive">{errors.unit_slug.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">หัวข้อ</Label>
        <Input id="title" {...register("title")} maxLength={255} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">รายละเอียด</Label>
        <Textarea id="body" rows={8} {...register("body")} />
        {errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment_url">ลิงก์ไฟล์แนบ (ไม่บังคับ)</Label>
        <Input id="attachment_url" type="url" placeholder="https://…" {...register("attachment_url")} />
        {errors.attachment_url && <p className="text-sm text-destructive">{errors.attachment_url.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">สถานะ</Label>
          <Select value={watch("status")} onValueChange={(v) => setValue("status", v as FormValues["status"])}>
            <SelectTrigger id="status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">ฉบับร่าง</SelectItem>
              <SelectItem value="published">เผยแพร่</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="posted_at">วันที่ (ไม่บังคับ)</Label>
          <Input id="posted_at" type="date" {...register("posted_at")} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        บันทึก
      </Button>
    </form>
  );
}
```

หมายเหตุ: หน้าเพิ่ม/แก้ไขต้องส่ง prop ชื่อ `initial` (ไม่ใช่ `post`) ให้ตรงกับคอมโพเนนต์นี้

- [ ] **Step 3: เขียนหน้าเพิ่ม**

```tsx
// app/admin/unit-posts/create/page.tsx
import { UnitPostForm } from "../unit-post-form";

export const metadata = { title: "เพิ่มรายการงาน" };

export default function CreateUnitPostPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[var(--admin-ink)]">เพิ่มรายการงาน</h1>
      <UnitPostForm />
    </div>
  );
}
```

- [ ] **Step 4: เขียนหน้าแก้ไข**

```tsx
// app/admin/unit-posts/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { getUnitPost } from "@/lib/data";
import { UnitPostForm } from "../../unit-post-form";

export const metadata = { title: "แก้ไขรายการงาน" };

export default async function EditUnitPostPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getUnitPost(id);
  if (!post) notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[var(--admin-ink)]">แก้ไขรายการงาน</h1>
      <UnitPostForm initial={post} />
    </div>
  );
}
```

- [ ] **Step 5: ตรวจ build**

Run: `npm run build`
Expected: เห็น route `/admin/unit-posts/create` และ `/admin/unit-posts/[id]/edit`

- [ ] **Step 6: commit**

```bash
git add app/admin/unit-posts
git commit -m "feat: ฟอร์มเพิ่มและแก้ไขรายการงาน"
```

---

### Task 11: เมนูหลังบ้าน

**Files:**
- Modify: `components/admin/admin-nav.ts`

- [ ] **Step 1: ยืนยันว่าเทสเดิมไม่ล็อกจำนวนเมนู**

Run: `cat components/admin/admin-nav.test.ts`
เทสปัจจุบันเช็กแค่ว่า role ไหนเห็น href ไหน ไม่ได้นับจำนวน จึงเพิ่มเมนูได้โดยไม่ต้องแก้เทส
เมนูใหม่ไม่ใส่ `roles` = ทุก role ที่เข้าหลังบ้านได้เห็น ตรงกับที่ editor ต้องลงงานได้

- [ ] **Step 2: เพิ่มเมนู**

ใน `ADMIN_NAV` แทรกต่อจาก "ข่าวประชาสัมพันธ์" และเพิ่ม `Briefcase` เข้าไปใน import จาก lucide-react:

```ts
{ href: "/admin/unit-posts", label: "งานในฝ่าย", icon: Briefcase },
```

- [ ] **Step 3: รันเทส**

Run: `npm test`
Expected: PASS ทั้งหมด 30 เทสเหมือนเดิม

- [ ] **Step 4: commit**

```bash
git add components/admin/admin-nav.ts
git commit -m "feat: เพิ่มเมนูงานในฝ่ายในหลังบ้าน"
```

---

### Task 12: ให้หน้า /about ใช้รายชื่องานชุดเดียวกัน

**Files:**
- Modify: `app/(public)/about/page.tsx:18-27,70-85`

- [ ] **Step 1: ลบ SCOPE เดิมแล้วใช้ UNITS**

ลบ `const SCOPE = [...]` ทั้งก้อน และลบไอคอนที่ import มาเพื่อ SCOPE โดยเฉพาะ (`Building2, Car, Megaphone, FileStack, HeartPulse, UtensilsCrossed, ShieldCheck, Sparkles`) เก็บไว้เฉพาะ `Target, Eye` ที่ส่วนวิสัยทัศน์ยังใช้ แล้วเพิ่ม:

```ts
import { UNITS } from "@/lib/units";
```

- [ ] **Step 2: เปลี่ยนส่วนแสดงผลให้ลิงก์ไปหน้างาน**

แทน `{SCOPE.map((s) => (<div ...>))}` ด้วย:

```tsx
{UNITS.map((u) => (
  <Link
    key={u.slug}
    href={`/units/${u.slug}`}
    className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
  >
    <span className="grid size-12 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10">
      <u.icon className="size-6" aria-hidden />
    </span>
    <span className="text-sm font-medium text-foreground">{u.label}</span>
  </Link>
))}
```

เพิ่ม `import Link from "next/link";` ถ้ายังไม่มี

- [ ] **Step 3: ตรวจ build**

Run: `npm run build`
Expected: `✓ Compiled successfully` และไม่มี warning เรื่อง import ที่ไม่ได้ใช้

- [ ] **Step 4: commit**

```bash
git add "app/(public)/about/page.tsx"
git commit -m "refactor: หน้าเกี่ยวกับเราใช้รายชื่องานชุดเดียวกับหน้างานในฝ่าย"
```

---

### Task 13: แก้สีแถบหัวหน้าย่อยให้ตรงแบรนด์

**Files:**
- Modify: `components/public/page-hero.tsx:14-22`

- [ ] **Step 1: เปลี่ยนสี**

```tsx
<section className="relative overflow-hidden border-b border-gold bg-gradient-to-r from-brand-navy to-navy-deep text-white">
  <div
    className="pointer-events-none absolute inset-0 opacity-20"
    style={{
      backgroundImage: "radial-gradient(circle, rgba(230,201,128,0.5) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    }}
    aria-hidden
  />
```

และเปลี่ยนสีตัวหนังสือใน breadcrumb จาก `text-slate-300` เป็น `text-white/75`, `hover:text-gold` เป็น `hover:text-gold-light`, `text-gold` (หน้าปัจจุบัน) เป็น `text-gold-light`, `text-slate-500` เป็น `text-white/40`, และ subtitle `text-slate-300` เป็น `text-white/80`

- [ ] **Step 2: ตรวจว่าไม่เหลือสีฮาร์ดโค้ด**

Run: `grep -rn "from-\[#\|to-\[#\|via-\[#\|slate-300\|slate-500" components/public/page-hero.tsx`
Expected: ว่าง

- [ ] **Step 3: commit**

```bash
git add components/public/page-hero.tsx
git commit -m "fix: แถบหัวหน้าย่อยใช้กรมท่าของแบรนด์แทนสีเทาเดิม"
```

---

### Task 14: ตรวจรวมและขึ้นเว็บ

- [ ] **Step 1: ชุดตรวจอัตโนมัติ**

```bash
npm run build && npm test && grep -rE "(amber|yellow|orange)-[0-9]" app components lib --include=*.tsx --include=*.ts --include=*.css
```
Expected: build ผ่าน · เทสผ่านทั้งหมด · grep ไม่เจออะไร

- [ ] **Step 2: ตรวจด้วยตาบนเครื่อง**

เปิด `npm run dev` แล้วดู `/units` และ `/units/building` ทั้งโหมดสว่างและมืด ที่ความกว้าง 1440px และ 390px
หมายเหตุ: ถ้า `.env.local` ยังเป็น placeholder รายการจะว่างทุกงาน ให้ตรวจแค่เลย์เอาต์กับสี

- [ ] **Step 3: push**

```bash
git push origin codex/initial-website
```

- [ ] **Step 4: deploy**

```bash
npx vercel deploy --prod
```

- [ ] **Step 5: ตรวจบนเว็บจริง**

เปิด https://general-affairs-website.vercel.app/units แล้วตรวจว่าเมนู "งานในฝ่าย" ขึ้น การ์ด 14 ใบครบ และคลิกเข้าหน้าย่อยได้
ถ้ายังไม่ได้รัน migration ของ Task 2 หน้าย่อยจะขึ้น "ยังไม่มีรายการของงานนี้" ซึ่งถูกต้อง แต่หน้าแอดมินจะบันทึกไม่ได้

---

## สิ่งที่ต้องขอจากผู้ใช้ระหว่างทาง

1. **รัน migration `0009_unit_posts.sql` บน Supabase SQL Editor** (Task 2 Step 3) — ถ้าไม่รัน หน้าแอดมินจะบันทึกไม่ได้
2. **ชื่อผู้รับผิดชอบทั้ง 14 งาน** — เติมลงฟิลด์ `owner` ใน `lib/units.ts` ตอนนี้ปล่อยว่างไว้ หน้าเว็บจะขึ้นว่า "ยังไม่ได้ระบุ"

## นอกขอบเขต

- ไม่ทำหน้า CRUD สำหรับ "ตัวงาน" เอง (เพิ่ม/ลบงาน) เพราะโครงสร้างฝ่ายไม่เปลี่ยนบ่อย ถ้าต้องเพิ่มงานใหม่ให้แก้ `lib/units.ts` แล้ว deploy
- ไม่ทำระบบอัปโหลดไฟล์แนบในตัว ใช้เป็นช่องกรอกลิงก์ก่อน (อัปไฟล์ผ่านเมนูเอกสารดาวน์โหลดเดิมแล้วคัดลอกลิงก์มาวาง)
- ไม่ผูกโพสต์งานเข้ากับหน้าข่าวรวม ตามที่ผู้ใช้เลือกให้แยกระบบ
