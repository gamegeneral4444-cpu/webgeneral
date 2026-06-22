# Analytics, Verification & Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปิด Vercel Web Analytics สำหรับเว็บไซต์จริง พร้อมสถิติ page views แบบรวมรายวันใน Dashboard โดยไม่เก็บข้อมูลระบุตัวบุคคล แล้วตรวจสอบและ deploy ระบบทั้งหมดขึ้น Production

**Architecture:** ใช้ `@vercel/analytics` เป็น analytics หลักบน Vercel และใช้ endpoint ฝั่ง Next.js บันทึกเฉพาะ `{date, path, page_views}` ลง Supabase เพื่อแสดงกราฟใน Admin Dashboard ข้อมูลถูก aggregate ตั้งแต่ตอนเขียน ไม่มี cookie, IP, visitor ID หรือ user agent ในฐานข้อมูล การเขียนทำผ่าน Server-only Supabase client และ RPC แบบ atomic เท่านั้น

**Tech Stack:** Next.js 16 App Router, `@vercel/analytics`, Recharts, Supabase Postgres/RLS/RPC, Vitest, Testing Library, Vercel CLI

---

## File Map

- Create: `supabase/migrations/0005_analytics.sql` — aggregate table, RLS, atomic RPC
- Create: `supabase/tests/0005_analytics.sql` — database assertions
- Modify: `package.json` — analytics/chart dependencies
- Modify: `app/layout.tsx` — Vercel Analytics component
- Create: `components/public/page-view-tracker.tsx` — route-change tracker
- Modify: `app/(public)/layout.tsx` — mount first-party tracker only on public pages
- Create: `app/api/analytics/page-view/route.ts` — validated cookieless collector
- Create: `lib/analytics.ts` — path normalization and payload validation
- Create: `lib/analytics.test.ts` — pure analytics tests
- Create: `lib/supabase/admin.ts` — server-only service-role client
- Modify: `lib/admin-data.ts` — read daily analytics aggregates
- Modify: `components/admin/dashboard/analytics-summary.tsx` — real chart and empty state
- Create: `components/admin/dashboard/analytics-summary.test.tsx` — chart summary tests
- Create: `app/(public)/privacy/page.tsx` — concise analytics/privacy notice
- Modify: `components/public/site-footer.tsx` — privacy link
- Create: `tests/routes.test.ts` — route contract smoke tests
- Modify: `.env.example` — document server-only analytics requirements
- Modify: `README.md` — migration, environment, verification, deploy runbook

### Task 1: Add Privacy-Safe Analytics Storage

**Files:**
- Create: `supabase/migrations/0005_analytics.sql`
- Create: `supabase/tests/0005_analytics.sql`

- [ ] **Step 1: Write the failing SQL verification**

Create `supabase/tests/0005_analytics.sql`:

```sql
begin;

do $$
begin
  if to_regclass('public.analytics_daily') is null then
    raise exception 'analytics_daily is missing';
  end if;
  if to_regprocedure('public.increment_page_view(text,date)') is null then
    raise exception 'increment_page_view(text,date) is missing';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'analytics_daily'
      and policyname = 'analytics admin read'
  ) then
    raise exception 'analytics admin read policy is missing';
  end if;
end $$;

rollback;
```

- [ ] **Step 2: Verify it fails before applying the migration**

Run:

```powershell
supabase db execute -f supabase/tests/0005_analytics.sql
```

Expected: FAIL because the table and RPC do not exist.

- [ ] **Step 3: Create the migration**

Create `supabase/migrations/0005_analytics.sql`:

```sql
create table if not exists public.analytics_daily (
  date date not null,
  path text not null check (path like '/%' and length(path) <= 300),
  page_views bigint not null default 0 check (page_views >= 0),
  updated_at timestamptz not null default now(),
  primary key (date, path)
);

alter table public.analytics_daily enable row level security;

drop policy if exists "analytics admin read" on public.analytics_daily;
create policy "analytics admin read" on public.analytics_daily
  for select using (
    public.get_current_user_role() in ('super_admin','admin','editor','viewer')
  );

create or replace function public.increment_page_view(
  page_path text,
  view_date date default (now() at time zone 'Asia/Bangkok')::date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if page_path is null or page_path !~ '^/[A-Za-z0-9/_-]*$' or length(page_path) > 300 then
    raise exception 'invalid analytics path';
  end if;

  insert into public.analytics_daily(date, path, page_views)
  values (view_date, page_path, 1)
  on conflict (date, path) do update
    set page_views = public.analytics_daily.page_views + 1,
        updated_at = now();
end;
$$;

revoke all on function public.increment_page_view(text,date) from public, anon, authenticated;
grant execute on function public.increment_page_view(text,date) to service_role;
```

Do not create public insert/update/delete policies. The API uses the server-only service-role client.

- [ ] **Step 4: Apply and verify**

```powershell
supabase db push
supabase db execute -f supabase/tests/0005_analytics.sql
```

Expected: migration and assertions succeed.

- [ ] **Step 5: Commit**

```powershell
git add supabase/migrations/0005_analytics.sql supabase/tests/0005_analytics.sql
git commit -m "feat: add privacy-safe analytics aggregates"
```

### Task 2: Enable Vercel Analytics and Build the Aggregate Collector

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `app/layout.tsx`
- Create: `lib/supabase/admin.ts`
- Create: `lib/analytics.ts`
- Create: `lib/analytics.test.ts`
- Create: `app/api/analytics/page-view/route.ts`
- Create: `components/public/page-view-tracker.tsx`
- Modify: `app/(public)/layout.tsx`

- [ ] **Step 1: Install production dependencies**

```powershell
npm install @vercel/analytics recharts
```

Expected: package files update and install exits 0.

- [ ] **Step 2: Write failing normalization tests**

Create `lib/analytics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizeAnalyticsPath } from "./analytics";

describe("normalizeAnalyticsPath", () => {
  it("removes query strings and trailing slashes", () => {
    expect(normalizeAnalyticsPath("/news/?campaign=x")).toBe("/news");
  });

  it("rejects admin, api, login, and external paths", () => {
    expect(normalizeAnalyticsPath("/admin")).toBeNull();
    expect(normalizeAnalyticsPath("/api/test")).toBeNull();
    expect(normalizeAnalyticsPath("/login")).toBeNull();
    expect(normalizeAnalyticsPath("https://example.com/news")).toBeNull();
  });
});
```

- [ ] **Step 3: Run and verify failure**

Run: `npm test -- lib/analytics.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 4: Implement strict path normalization**

Create `lib/analytics.ts`:

```ts
const EXCLUDED_PREFIXES = ["/admin", "/api", "/login", "/_next"];

export function normalizeAnalyticsPath(input: unknown): string | null {
  if (typeof input !== "string" || !input.startsWith("/") || input.startsWith("//")) return null;
  const path = input.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (path.length > 300 || EXCLUDED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return null;
  return /^\/[A-Za-z0-9/_-]*$/.test(path) ? path : null;
}
```

- [ ] **Step 5: Add the server-only client and collector route**

`lib/supabase/admin.ts` must import `"server-only"`, require `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and create a Supabase client with auth persistence disabled.

`POST /api/analytics/page-view` must:

1. Reject non-JSON bodies with 400.
2. Normalize `body.path`; return 400 for invalid/excluded paths.
3. Reject cross-site browser requests by comparing `Origin` with the configured site origin and checking `Sec-Fetch-Site` when present.
4. Call `rpc("increment_page_view", { page_path: path })` with the server-only client.
5. Return 204 on success and 503 on database failure.
6. Never read or store IP, cookies, referer, or user-agent.

- [ ] **Step 6: Add the public route tracker and Vercel Analytics**

`PageViewTracker` is a small Client Component using `usePathname()` and `navigator.sendBeacon` with a `fetch(..., { keepalive: true })` fallback. It posts only the pathname after every public route change.

Mount `<PageViewTracker />` in `app/(public)/layout.tsx`. Mount `<Analytics />` from `@vercel/analytics/next` once in root `app/layout.tsx`.

- [ ] **Step 7: Run tests, lint, and build**

```powershell
npm test -- lib/analytics.test.ts
npm run lint
npm run build
```

Expected: tests pass, lint has no errors, production build exits 0.

- [ ] **Step 8: Commit**

```powershell
git add package.json package-lock.json app/layout.tsx "app/(public)/layout.tsx" app/api/analytics components/public/page-view-tracker.tsx lib/analytics.ts lib/analytics.test.ts lib/supabase/admin.ts
git commit -m "feat: track public page views without identifiers"
```

### Task 3: Render Real Analytics on the Admin Dashboard

**Files:**
- Modify: `lib/admin-data.ts`
- Modify: `types/database.ts`
- Modify: `components/admin/dashboard/analytics-summary.tsx`
- Create: `components/admin/dashboard/analytics-summary.test.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Write failing chart-summary tests**

```tsx
it("summarizes page views for the selected period", () => {
  render(<AnalyticsSummary rows={[
    { date: "2026-06-22", path: "/", page_views: 4 },
    { date: "2026-06-23", path: "/news", page_views: 6 },
  ]} />);
  expect(screen.getByText("10")).toBeInTheDocument();
  expect(screen.getByText("2 วัน")).toBeInTheDocument();
});

it("does not invent analytics data", () => {
  render(<AnalyticsSummary rows={[]} />);
  expect(screen.getByText("ยังไม่มีข้อมูลการเข้าชม")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- components/admin/dashboard/analytics-summary.test.tsx`

Expected: FAIL until the component supports real rows.

- [ ] **Step 3: Add the analytics query**

`adminListAnalytics(days = 30)` must:

- clamp `days` to 1–90
- select `date,path,page_views` from `analytics_daily`
- filter from the Bangkok calendar date `days - 1` days ago
- order by date ascending
- return `[]` on unavailable data so the UI shows an honest empty state

- [ ] **Step 4: Implement the chart**

Aggregate all paths into one total per date before rendering a responsive Recharts bar chart. Include textual totals and an accessible table/summary so the chart is not the only representation of the data. Add a link to the Vercel project Analytics page only when `NEXT_PUBLIC_VERCEL_PROJECT_URL` is configured; otherwise omit the link.

- [ ] **Step 5: Run checks**

```powershell
npm test -- components/admin/dashboard/analytics-summary.test.tsx
npm run lint
npm run build
```

Expected: PASS, no lint errors, build exits 0.

- [ ] **Step 6: Commit**

```powershell
git add lib/admin-data.ts types/database.ts components/admin/dashboard/analytics-summary.tsx components/admin/dashboard/analytics-summary.test.tsx app/admin/page.tsx
git commit -m "feat: show live page-view analytics"
```

### Task 4: Add Privacy Notice and Operational Documentation

**Files:**
- Create: `app/(public)/privacy/page.tsx`
- Modify: `components/public/site-footer.tsx`
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Add a concise privacy page**

The page must state that the site collects aggregate page-view counts for service improvement and does not store cookie identifiers, raw IP addresses, or full user agents in the first-party analytics table. Provide a contact route for privacy questions. Do not claim legal compliance certification.

- [ ] **Step 2: Link the notice from the footer**

Add `/privacy` as a visible keyboard-accessible footer link.

- [ ] **Step 3: Document environment and deployment requirements**

`.env.example` lists names only, never values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=
NEXT_PUBLIC_VERCEL_PROJECT_URL=
```

`README.md` must document:

1. apply migrations `0004` and `0005`
2. run SQL assertions
3. set Vercel environment variables for Production and Preview
4. enable Web Analytics in Vercel project settings
5. run tests/lint/build
6. verify public page tracking and admin empty/data states

- [ ] **Step 4: Run secret and content checks**

```powershell
git grep -n -E "SUPABASE_SERVICE_ROLE_KEY=.+|sb_secret_|service_role" -- ':!package-lock.json' ':!.env.example'
npm run lint
```

Expected: no committed secret value; lint passes.

- [ ] **Step 5: Commit**

```powershell
git add "app/(public)/privacy/page.tsx" components/public/site-footer.tsx .env.example README.md
git commit -m "docs: add analytics privacy and deploy runbook"
```

### Task 5: Full Verification and Production Deployment

**Files:**
- Create: `tests/routes.test.ts`
- Modify: `README.md` only if verification uncovers a missing operational step

- [ ] **Step 1: Add route contract tests**

Test pure route rules and rendered links for:

- `/`, `/news`, `/downloads`, `/services`, `/gallery`, `/staff`, `/privacy`
- `/admin` requires authenticated layout
- analytics normalization excludes `/admin`, `/api`, and `/login`
- navigation and footer links point to existing routes

- [ ] **Step 2: Run the complete local quality gate**

```powershell
npm test
npm run lint
npm run build
git status --short
```

Expected: all tests pass; lint/build pass; only intentional files are changed.

- [ ] **Step 3: Apply production database migrations**

Run the linked Supabase migration workflow, then execute:

```powershell
supabase db execute -f supabase/tests/0004_admin_cms_audit.sql
supabase db execute -f supabase/tests/0005_analytics.sql
```

Expected: both assertion scripts succeed. If the local CLI is not linked, copy each migration into Supabase SQL Editor in numeric order and then run the assertion scripts there.

- [ ] **Step 4: Verify Vercel environment without revealing values**

```powershell
vercel env ls
```

Required in Production: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`. Optional: `NEXT_PUBLIC_VERCEL_PROJECT_URL`.

- [ ] **Step 5: Deploy preview and smoke-test it**

```powershell
vercel deploy
```

Check the returned preview URL:

- public home/news/downloads return 200
- login returns 200
- anonymous `/admin` redirects to `/login`
- `POST /api/analytics/page-view` with `{ "path": "/news" }` returns 204
- an invalid path returns 400
- no new 5xx logs appear

- [ ] **Step 6: Deploy production and verify live data**

```powershell
vercel deploy --prod
```

Open at least two public pages, then verify one minute later that `analytics_daily` increases and the admin Dashboard shows the real aggregate. Also verify add/edit/delete for one non-critical test record and confirm the matching audit entry appears.

- [ ] **Step 7: Push the verified branch and update the existing PR**

```powershell
git status --short
git log --oneline -10
git push -u origin codex/initial-website
```

Confirm the GitHub branch contains the final commit and the existing pull request updates successfully.

- [ ] **Step 8: Record the final verification commit if needed**

Only if verification required tracked fixes or README corrections:

```powershell
git add README.md tests/routes.test.ts
git commit -m "test: verify admin dashboard release"
git push
```

## Milestone 3 Acceptance

- Vercel Web Analytics is mounted once and enabled for the project.
- Dashboard shows real aggregate page views or an explicit empty state; it never invents numbers.
- The first-party aggregate table contains no raw IP, cookie ID, visitor ID, or user-agent columns.
- All migrations and SQL assertions pass.
- Unit/component tests, lint, and production build pass.
- Preview and production smoke tests pass.
- Verified changes are pushed to `gamegeneral4444-cpu/webgeneral.git` and visible in the existing pull request.
