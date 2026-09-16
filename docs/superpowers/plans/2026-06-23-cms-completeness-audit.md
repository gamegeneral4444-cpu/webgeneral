# CMS Completeness & Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เติมความสามารถ CMS ที่ยังขาด ได้แก่ CRUD หมวดหมู่ การแก้คำบรรยาย/ลำดับรูป ประวัติกิจกรรม และการป้องกันการจัดการผู้ใช้ผิดสิทธิ์

**Architecture:** ใช้ตาราง Supabase เดิม เพิ่ม database audit triggers และ indexes ผ่าน migration เดียว Server Actions ยังคงเป็น mutation boundary และ UI แยกตามโมดูลโดย reuse form/table primitives

**Tech Stack:** Supabase Postgres/RLS/Storage, Next.js Server Actions, Zod, React Hook Form, shadcn/ui, Vitest

---

## File Map

- Create: `supabase/migrations/0004_admin_cms_audit.sql`
- Create: `supabase/tests/0004_admin_cms_audit.sql` — SQL assertions runnable in SQL Editor/psql
- Modify: `lib/validations.ts` — category and gallery-image schemas
- Create: `lib/validations.test.ts` — validation tests
- Create: `lib/actions/categories.ts` — category CRUD
- Modify: `lib/actions/gallery.ts` — caption/reorder mutations
- Modify: `lib/actions/users.ts` — self-protection and last-super-admin protection
- Create: `lib/actions/category-payload.ts` — pure category parser for unit tests
- Create: `lib/actions/category-payload.test.ts` — parser tests
- Modify: `lib/admin-data.ts` — category counts and audit list/detail
- Modify: `types/database.ts` — category counts/audit details
- Create: `app/admin/categories/page.tsx` — tabbed category manager
- Create: `app/admin/categories/category-manager.tsx` — client table/forms
- Create: `app/admin/categories/category-form.tsx` — reusable category form
- Modify: `app/admin/gallery/image-manager.tsx` — caption/reorder UI
- Create: `app/admin/activity/page.tsx` — audit list/filter
- Create: `app/admin/activity/audit-detail-dialog.tsx` — before/after view
- Modify: `app/admin/users/user-row.tsx` — self/last-admin disabled states
- Create: `components/admin/list-toolbar.tsx` — search/status filter shell
- Create: `components/admin/mobile-record-card.tsx` — responsive table alternative

### Task 1: Add Audit Triggers and Indexes

**Files:**
- Create: `supabase/migrations/0004_admin_cms_audit.sql`
- Create: `supabase/tests/0004_admin_cms_audit.sql`

- [ ] **Step 1: Write the failing SQL verification script**

Create `supabase/tests/0004_admin_cms_audit.sql`:

```sql
begin;

do $$
begin
  if to_regprocedure('public.write_audit_log()') is null then
    raise exception 'write_audit_log() is missing';
  end if;
  if not exists (
    select 1 from pg_trigger
    where tgname = 'audit_news_changes' and not tgisinternal
  ) then
    raise exception 'audit_news_changes trigger is missing';
  end if;
  if to_regclass('public.idx_audit_logs_created_at') is null then
    raise exception 'idx_audit_logs_created_at is missing';
  end if;
  if to_regprocedure('public.list_audit_summaries(integer,integer,text,text)') is null then
    raise exception 'list_audit_summaries(integer,integer,text,text) is missing';
  end if;
  if to_regprocedure('public.reorder_gallery_images(uuid,uuid[])') is null then
    raise exception 'reorder_gallery_images(uuid,uuid[]) is missing';
  end if;
end $$;

rollback;
```

- [ ] **Step 2: Run before migration and verify failure**

Run in Supabase SQL Editor or psql:

```powershell
supabase db execute -f supabase/tests/0004_admin_cms_audit.sql
```

Expected: FAIL with missing function/trigger/index.

- [ ] **Step 3: Create idempotent audit migration**

Create `supabase/migrations/0004_admin_cms_audit.sql` with:

```sql
create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_id uuid;
begin
  row_id := case when tg_op = 'DELETE' then old.id else new.id end;
  insert into public.audit_logs(user_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
create index if not exists idx_news_status_published_at on public.news(status, published_at desc);
create index if not exists idx_documents_category_created_at on public.documents(category_id, created_at desc);
create index if not exists idx_gallery_images_album_sort on public.gallery_images(album_id, sort_order);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','news','news_categories','documents','document_categories',
    'services','service_categories','gallery_albums','gallery_images','staff','site_settings'
  ] loop
    execute format('drop trigger if exists audit_%1$s_changes on public.%1$s', table_name);
    execute format(
      'create trigger audit_%1$s_changes after insert or update or delete on public.%1$s '
      'for each row execute function public.write_audit_log()', table_name
    );
  end loop;
end $$;

create or replace function public.list_audit_summaries(
  result_limit integer default 50,
  result_offset integer default 0,
  action_filter text default null,
  table_filter text default null
)
returns table (
  id uuid,
  user_id uuid,
  action text,
  table_name text,
  record_id uuid,
  created_at timestamptz,
  actor_full_name text,
  actor_email text,
  total_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_current_user_role() not in ('super_admin','admin','editor','viewer') then
    raise exception 'forbidden';
  end if;

  return query
  select a.id, a.user_id, a.action, a.table_name, a.record_id, a.created_at,
         p.full_name, p.email, count(*) over()
  from public.audit_logs a
  left join public.profiles p on p.id = a.user_id
  where (action_filter is null or a.action = action_filter)
    and (table_filter is null or a.table_name = table_filter)
  order by a.created_at desc
  limit least(greatest(result_limit, 1), 100)
  offset greatest(result_offset, 0);
end;
$$;

revoke all on function public.list_audit_summaries(integer,integer,text,text) from public, anon;
grant execute on function public.list_audit_summaries(integer,integer,text,text) to authenticated;

create or replace function public.reorder_gallery_images(
  target_album_id uuid,
  image_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.get_current_user_role() not in ('super_admin','admin','editor') then
    raise exception 'forbidden';
  end if;
  if coalesce(array_length(image_ids, 1), 0) <> (
    select count(*) from public.gallery_images where album_id = target_album_id
  ) or coalesce(array_length(image_ids, 1), 0) <> (
    select count(distinct id) from unnest(image_ids) as requested(id)
  ) or exists (
    select 1 from unnest(image_ids) as requested(id)
    where not exists (
      select 1 from public.gallery_images image
      where image.id = requested.id and image.album_id = target_album_id
    )
  ) then
    raise exception 'image set does not match album';
  end if;

  update public.gallery_images image
  set sort_order = (requested.position - 1)::integer
  from unnest(image_ids) with ordinality as requested(id, position)
  where image.id = requested.id and image.album_id = target_album_id;
end;
$$;

revoke all on function public.reorder_gallery_images(uuid,uuid[]) from public, anon;
grant execute on function public.reorder_gallery_images(uuid,uuid[]) to authenticated;
```

Do not add insert/update/delete policies to `audit_logs`; triggers write through the security-definer function and UI remains read-only. Keep direct `audit_logs` SELECT limited to super admin/admin for before/after details. Editor/viewer receive only summary columns through `list_audit_summaries`, so `old_data` and `new_data` are never exposed to them.

- [ ] **Step 4: Apply migration and run SQL verification**

```powershell
supabase db push
supabase db execute -f supabase/tests/0004_admin_cms_audit.sql
```

Expected: migration succeeds and SQL verification exits 0.

- [ ] **Step 5: Commit**

```powershell
git add supabase/migrations/0004_admin_cms_audit.sql supabase/tests/0004_admin_cms_audit.sql
git commit -m "feat: add content audit triggers"
```

### Task 2: Add Category Validation and Pure Payload Parsing

**Files:**
- Modify: `lib/validations.ts`
- Create: `lib/actions/category-payload.ts`
- Create: `lib/actions/category-payload.test.ts`
- Modify: `lib/validations.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { categorySchema } from "@/lib/validations";
import { parseCategoryFormData } from "@/lib/actions/category-payload";

it("rejects a category without a name", () => {
  expect(categorySchema.safeParse({ name: "", slug: "news", description: "", sort_order: 0, is_active: true }).success).toBe(false);
});

it("coerces sort order and active state", () => {
  const form = new FormData();
  form.set("name", "ประกาศ");
  form.set("slug", "announcement");
  form.set("sort_order", "4");
  form.set("is_active", "true");
  expect(parseCategoryFormData(form)).toMatchObject({ success: true, data: { sort_order: 4, is_active: true } });
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- lib/actions/category-payload.test.ts lib/validations.test.ts`

Expected: FAIL because schema/parser are absent.

- [ ] **Step 3: Implement schema and parser**

Add to `lib/validations.ts`:

```ts
export const categorySchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อหมวดหมู่").max(120),
  slug,
  description: z.string().max(500).optional().or(z.literal("")),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;
```

Create `lib/actions/category-payload.ts`:

```ts
import { categorySchema } from "@/lib/validations";

export function parseCategoryFormData(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  });
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- lib/actions/category-payload.test.ts lib/validations.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add lib/validations.ts lib/validations.test.ts lib/actions/category-payload.ts lib/actions/category-payload.test.ts
git commit -m "feat: validate category payloads"
```

### Task 3: Implement Safe Category CRUD

**Files:**
- Create: `lib/actions/categories.ts`
- Modify: `lib/admin-data.ts`
- Modify: `types/database.ts`
- Create: `lib/actions/categories.test.ts`

- [ ] **Step 1: Write failing action tests with mocked Supabase**

Test allowed table names and dependency checks:

```ts
it("rejects an unknown category table", async () => {
  const result = await createCategory("profiles" as never, new FormData());
  expect(result).toEqual({ ok: false, error: "ประเภทหมวดหมู่ไม่ถูกต้อง" });
});

it("refuses to delete a category still in use", async () => {
  mockReferenceCount(3);
  const result = await deleteCategory("news_categories", "category-id");
  expect(result.ok).toBe(false);
  expect(result.error).toContain("ยังมีข้อมูลใช้งานหมวดหมู่นี้");
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- lib/actions/categories.test.ts`

Expected: FAIL because actions are absent.

- [ ] **Step 3: Implement allowlisted CRUD**

Use a compile-time config:

```ts
export const CATEGORY_CONFIG = {
  news_categories: { foreignTable: "news", publicPath: "/news" },
  document_categories: { foreignTable: "documents", publicPath: "/downloads" },
  service_categories: { foreignTable: "services", publicPath: "/services" },
} as const;

export type CategoryTable = keyof typeof CATEGORY_CONFIG;
```

Each action must:

1. Validate table against `CATEGORY_CONFIG` before querying.
2. Call `authorize("manageSite")`.
3. Parse with `parseCategoryFormData`.
4. Convert duplicate-slug errors to `slug นี้ถูกใช้งานแล้ว`.
5. On delete, query the foreign table count and refuse when count > 0.
6. Revalidate `/admin/categories` and the configured public path.

- [ ] **Step 4: Add typed category usage counts**

Extend `Category`:

```ts
export interface CategoryWithCount extends Category {
  usage_count: number;
}
```

Add `adminListCategoriesWithCount(table)` that fetches categories and one count query per category with bounded concurrency (category lists are small).

- [ ] **Step 5: Run tests**

Run: `npm test -- lib/actions/categories.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add lib/actions/categories.ts lib/actions/categories.test.ts lib/admin-data.ts types/database.ts
git commit -m "feat: add safe category CRUD"
```

### Task 4: Build the Category Manager UI

**Files:**
- Create: `app/admin/categories/page.tsx`
- Create: `app/admin/categories/category-manager.tsx`
- Create: `app/admin/categories/category-form.tsx`
- Create: `app/admin/categories/category-manager.test.tsx`
- Create: `components/admin/list-toolbar.tsx`
- Create: `components/admin/mobile-record-card.tsx`

- [ ] **Step 1: Write failing UI tests**

```tsx
it("switches category groups without losing the add action", async () => {
  render(<CategoryManager datasets={datasets} />);
  await userEvent.click(screen.getByRole("tab", { name: "เอกสาร" }));
  expect(screen.getByRole("button", { name: "เพิ่มหมวดหมู่เอกสาร" })).toBeInTheDocument();
});

it("shows usage count and disables unsafe delete", () => {
  render(<CategoryManager datasets={datasetsWithUsedCategory} />);
  expect(screen.getByText("ใช้งาน 3 รายการ")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- app/admin/categories/category-manager.test.tsx`

Expected: FAIL because UI is absent.

- [ ] **Step 3: Implement server page and client manager**

`page.tsx` fetches all three datasets in `Promise.all`; `CategoryManager` owns tab/dialog state only. `CategoryForm` receives `table`, optional `initial`, and action result callbacks.

Use these tab labels and values:

```ts
const GROUPS = [
  { value: "news_categories", label: "ข่าว" },
  { value: "document_categories", label: "เอกสาร" },
  { value: "service_categories", label: "บริการ" },
] as const;
```

Render desktop table and mobile record cards from the same filtered array. All icon buttons require `aria-label`.

- [ ] **Step 4: Run tests and accessibility smoke**

Run:

```powershell
npm test -- app/admin/categories/category-manager.test.tsx
npm run lint
```

Expected: PASS and no lint errors.

- [ ] **Step 5: Commit**

```powershell
git add app/admin/categories components/admin/list-toolbar.tsx components/admin/mobile-record-card.tsx
git commit -m "feat: add category management UI"
```

### Task 5: Complete Gallery Image Management

**Files:**
- Modify: `lib/validations.ts`
- Modify: `lib/actions/gallery.ts`
- Modify: `app/admin/gallery/image-manager.tsx`
- Create: `lib/actions/gallery-images.test.ts`

- [ ] **Step 1: Write failing caption/reorder tests**

```ts
it("normalizes image order into consecutive integers", () => {
  expect(normalizeImageOrder(["c", "a", "b"])).toEqual([
    { id: "c", sort_order: 0 },
    { id: "a", sort_order: 1 },
    { id: "b", sort_order: 2 },
  ]);
});
```

Mock `authorize("write")` and assert `updateGalleryImage(id, { caption })` and `reorderGalleryImages(albumId, ids)` revalidate both admin edit and public album routes.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- lib/actions/gallery-images.test.ts`

Expected: FAIL because update/reorder functions are absent.

- [ ] **Step 3: Implement pure order normalization and actions**

```ts
export function normalizeImageOrder(ids: string[]) {
  return ids.map((id, sort_order) => ({ id, sort_order }));
}
```

`reorderGalleryImages` must validate UUIDs, ensure all rows belong to `albumId`, then update within a Supabase RPC transaction named `reorder_gallery_images` created in migration 0004.

- [ ] **Step 4: Implement accessible UI controls**

Each image card gets:

- caption input with explicit label
- Save caption button with pending state
- Move previous/next buttons (keyboard accessible)
- Delete button with confirmation

Do not rely on drag-and-drop as the only reorder mechanism.

- [ ] **Step 5: Run tests and build**

```powershell
npm test -- lib/actions/gallery-images.test.ts
npm run build
```

Expected: PASS and build exits 0.

- [ ] **Step 6: Commit**

```powershell
git add lib/validations.ts lib/actions/gallery.ts lib/actions/gallery-images.test.ts app/admin/gallery/image-manager.tsx supabase/migrations/0004_admin_cms_audit.sql
git commit -m "feat: complete gallery image management"
```

### Task 6: Add Activity Log UI and Harden User Management

**Files:**
- Create: `app/admin/activity/page.tsx`
- Create: `app/admin/activity/audit-detail-dialog.tsx`
- Create: `app/admin/activity/activity-page.test.tsx`
- Modify: `lib/admin-data.ts`
- Modify: `lib/actions/users.ts`
- Modify: `app/admin/users/user-row.tsx`
- Create: `lib/actions/users.test.ts`

- [ ] **Step 1: Write failing permission and activity tests**

```ts
it("prevents deactivating the current user", async () => {
  mockAuthorizedUser("self-id");
  expect(await toggleUserActive("self-id", false)).toEqual({
    ok: false,
    error: "ไม่สามารถระงับบัญชีของตนเองได้",
  });
});

it("prevents demoting the last active super admin", async () => {
  mockActiveSuperAdminCount(1);
  const result = await updateUserRole("last-super-id", "admin");
  expect(result.error).toContain("super admin คนสุดท้าย");
});
```

Activity UI tests assert filters for module/action and detail access hidden from editor/viewer.

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- lib/actions/users.test.ts app/admin/activity/activity-page.test.tsx`

Expected: last-super-admin and activity tests FAIL.

- [ ] **Step 3: Harden user actions**

Before changing an active super admin, count active super admins. Reject demotion/deactivation when the target is the final one. Keep existing self-protection.

- [ ] **Step 4: Implement activity queries and page**

`adminListAuditLogs({ page, action, table })` calls `list_audit_summaries` for every active dashboard role and returns `{ rows, total }`. For super admin/admin only, `adminGetAuditDetail(id)` queries the underlying `audit_logs` row, sanitizes it, and supplies the before/after dialog. Editor/viewer never query the underlying table.

The page displays:

- actor name/email
- Thai action label
- module label
- timestamp
- summary from safe fields only
- before/after dialog only when `canManageSite(role)`

Never render secrets/passwords. Add a sanitizer that removes keys matching `/password|token|secret|key/i` before returning audit details.

- [ ] **Step 5: Run all tests and quality gates**

```powershell
npm test
npm run lint
npm run build
```

Expected: all pass; lint has no errors; build exits 0.

- [ ] **Step 6: Commit milestone 2**

```powershell
git add app/admin/activity app/admin/users lib/actions/users.ts lib/actions/users.test.ts lib/admin-data.ts
git commit -m "feat: add activity log and harden users"
```

## Milestone 2 Acceptance

- Admin can manage all three category groups safely.
- Gallery captions and order can be edited without mouse-only interaction.
- Every content mutation writes immutable audit data.
- Audit details never expose sensitive keys.
- Current/last super admin cannot be locked out.
- Tests, lint, build, and SQL verification pass.
