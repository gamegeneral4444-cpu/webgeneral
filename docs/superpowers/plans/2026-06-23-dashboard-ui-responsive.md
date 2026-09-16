# Dashboard UI & Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้าง Admin shell และหน้า Dashboard โทนน้ำเงินกรมท่า–ทองตามแบบอ้างอิง พร้อม Desktop sidebar และ Tablet/Mobile hamburger Sheet

**Architecture:** คง Next.js App Router และ Server Components สำหรับดึงข้อมูล แยก Client Component เฉพาะ navigation interactions และ chart interactions ใช้ design tokens ใน `app/globals.css` และ component ขนาดเล็กที่รับ typed view model เพื่อให้ทดสอบแยกได้

**Tech Stack:** Next.js 16.2.9, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Lucide, Vitest, Testing Library

---

## File Map

- Modify: `package.json` — เพิ่ม test scripts/dependencies
- Create: `vitest.config.mts` — Vitest + jsdom + path aliases
- Create: `tests/setup.ts` — Testing Library cleanup/matchers
- Create: `lib/permissions.test.ts` — role/navigation behavior
- Modify: `app/globals.css` — navy/gold admin tokens and responsive utilities
- Modify: `components/admin/admin-nav.ts` — categories/activity navigation
- Create: `components/admin/admin-nav.test.ts` — role-filtered navigation tests
- Modify: `components/admin/admin-shell.tsx` — approved desktop/tablet/mobile shell
- Create: `components/admin/admin-shell.test.tsx` — accessibility and hamburger behavior
- Create: `components/admin/dashboard/stat-card.tsx` — KPI card
- Create: `components/admin/dashboard/quick-actions.tsx` — role-aware shortcuts
- Create: `components/admin/dashboard/recent-news-table.tsx` — compact table/card rows
- Create: `components/admin/dashboard/recent-documents.tsx` — recent files widget
- Create: `components/admin/dashboard/recent-staff.tsx` — staff widget
- Create: `components/admin/dashboard/activity-timeline.tsx` — audit summary widget
- Create: `components/admin/dashboard/analytics-summary.tsx` — chart shell/data state
- Create: `components/admin/dashboard/dashboard-components.test.tsx` — dashboard component tests
- Modify: `lib/data.ts` — expanded dashboard stats
- Modify: `lib/admin-data.ts` — recent activity/staff/document queries
- Modify: `types/database.ts` — dashboard/audit/analytics view types
- Modify: `app/admin/page.tsx` — compose approved layout

### Task 1: Add the Test Foundation

**Files:**
- Modify: `package.json`
- Create: `vitest.config.mts`
- Create: `tests/setup.ts`
- Create: `tests/smoke.test.ts`

- [ ] **Step 1: Install test dependencies**

Run:

```powershell
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `package-lock.json` changes and command exits 0.

- [ ] **Step 2: Add deterministic test scripts**

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    clearMocks: true,
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

- [ ] **Step 4: Write and run the first failing smoke test**

Create `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test environment", () => {
  it("provides a DOM", () => {
    expect(document.createElement("div")).toBeInstanceOf(HTMLDivElement);
  });
});
```

Run: `npm test`

Expected: PASS, 1 test.

- [ ] **Step 5: Commit the test foundation**

```powershell
git add package.json package-lock.json vitest.config.mts tests
git commit -m "test: add dashboard test foundation"
```

### Task 2: Lock Navigation and Role Behavior

**Files:**
- Modify: `components/admin/admin-nav.ts`
- Create: `components/admin/admin-nav.test.ts`

- [ ] **Step 1: Write failing navigation tests**

Create `components/admin/admin-nav.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { visibleNav } from "./admin-nav";

describe("visibleNav", () => {
  it("shows categories and activity to admin", () => {
    const hrefs = visibleNav("admin").map((item) => item.href);
    expect(hrefs).toContain("/admin/categories");
    expect(hrefs).toContain("/admin/activity");
    expect(hrefs).not.toContain("/admin/users");
  });

  it("shows user management only to super admin", () => {
    expect(visibleNav("super_admin").map((item) => item.href)).toContain("/admin/users");
    expect(visibleNav("viewer").map((item) => item.href)).not.toContain("/admin/users");
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- components/admin/admin-nav.test.ts`

Expected: FAIL because categories/activity routes are absent.

- [ ] **Step 3: Add navigation entries**

Update `components/admin/admin-nav.ts` with Lucide `Tags` and `History` entries:

```ts
{ href: "/admin/categories", label: "จัดการหมวดหมู่", icon: Tags, roles: ["super_admin", "admin"] },
{ href: "/admin/activity", label: "ประวัติกิจกรรม", icon: History },
```

- [ ] **Step 4: Re-run the test**

Run: `npm test -- components/admin/admin-nav.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add components/admin/admin-nav.ts components/admin/admin-nav.test.ts
git commit -m "feat: add categories and activity navigation"
```

### Task 3: Implement the Approved Admin Shell

**Files:**
- Modify: `app/globals.css`
- Modify: `components/admin/admin-shell.tsx`
- Create: `components/admin/admin-shell.test.tsx`

- [ ] **Step 1: Write failing shell tests**

Mock `next/navigation`, `next/link`, and `logoutAction`, then assert:

```tsx
it("renders the permanent sidebar only at the desktop shell boundary", () => {
  render(<AdminShell role="admin" fullName="ผู้ดูแล" email="admin@example.com">เนื้อหา</AdminShell>);
  expect(screen.getByRole("navigation", { name: "เมนูหลังบ้าน" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "เปิดเมนู" })).toBeInTheDocument();
});

it("opens a labeled navigation sheet from the hamburger button", async () => {
  const user = userEvent.setup();
  render(<AdminShell role="admin" fullName="ผู้ดูแล" email="admin@example.com">เนื้อหา</AdminShell>);
  await user.click(screen.getByRole("button", { name: "เปิดเมนู" }));
  expect(screen.getByRole("dialog", { name: "เมนูหลังบ้าน" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and capture the failing assertion**

Run: `npm test -- components/admin/admin-shell.test.tsx`

Expected: FAIL until the dialog labeling and approved structure are implemented.

- [ ] **Step 3: Add admin design tokens**

In `app/globals.css`, define semantic tokens rather than hard-coded colors inside components:

```css
:root {
  --admin-navy: #082b55;
  --admin-navy-strong: #061f3e;
  --admin-gold: #d99a04;
  --admin-gold-bright: #f2b91e;
  --admin-ink: #102a4c;
  --admin-surface: #f8fafc;
  --admin-border: #e8dfcf;
}
```

- [ ] **Step 4: Refactor `AdminShell` without changing authorization**

Required structure:

```tsx
<div className="min-h-dvh bg-[var(--admin-surface)] lg:grid lg:grid-cols-[16.5rem_1fr]">
  <aside className="sticky top-0 hidden h-dvh bg-[var(--admin-navy)] lg:flex lg:flex-col">
    <SidebarBrand />
    <NavLinks role={role} />
    <WebsiteLink />
  </aside>
  <div className="min-w-0">
    <AdminTopbar onOpenMenu={() => setOpen(true)} {...userProps} />
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" aria-describedby={undefined} className="w-72 bg-[var(--admin-navy)] p-0">
        <SheetTitle className="sr-only">เมนูหลังบ้าน</SheetTitle>
        <SidebarBrand />
        <NavLinks role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
    <main className="p-4 sm:p-6 xl:p-7">{children}</main>
  </div>
</div>
```

Use `lg` as the permanent-sidebar boundary so 768–1023px always uses hamburger/Sheet.

- [ ] **Step 5: Run shell tests, lint, and build**

Run:

```powershell
npm test -- components/admin/admin-shell.test.tsx
npm run lint
npm run build
```

Expected: tests PASS; lint has no errors; build exits 0.

- [ ] **Step 6: Commit**

```powershell
git add app/globals.css components/admin/admin-shell.tsx components/admin/admin-shell.test.tsx
git commit -m "feat: redesign responsive admin shell"
```

### Task 4: Build Typed Dashboard Components

**Files:**
- Create: `components/admin/dashboard/stat-card.tsx`
- Create: `components/admin/dashboard/quick-actions.tsx`
- Create: `components/admin/dashboard/recent-news-table.tsx`
- Create: `components/admin/dashboard/recent-documents.tsx`
- Create: `components/admin/dashboard/recent-staff.tsx`
- Create: `components/admin/dashboard/activity-timeline.tsx`
- Create: `components/admin/dashboard/analytics-summary.tsx`
- Create: `components/admin/dashboard/dashboard-components.test.tsx`

- [ ] **Step 1: Write failing component tests**

Cover accessible labels, status text, empty state, and links:

```tsx
it("renders KPI value and destination", () => {
  render(<StatCard label="ข่าวทั้งหมด" value={24} href="/admin/news" icon={Newspaper} />);
  expect(screen.getByText("24")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /ข่าวทั้งหมด/ })).toHaveAttribute("href", "/admin/news");
});

it("shows a useful empty state", () => {
  render(<RecentNewsTable rows={[]} />);
  expect(screen.getByText("ยังไม่มีข่าว")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- components/admin/dashboard/dashboard-components.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement focused components**

`StatCard` public contract:

```tsx
type StatCardProps = {
  label: string;
  value: number | string;
  caption?: string;
  href: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, caption, href, icon: Icon }: StatCardProps) {
  return (
    <Link href={href} aria-label={`${label}: ${value}`} className="group rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm transition-colors hover:border-[var(--admin-gold)]">
      <Icon aria-hidden className="size-5 text-[var(--admin-gold)]" />
      <strong className="mt-3 block text-2xl text-[var(--admin-ink)]">{value}</strong>
      <span className="text-sm font-medium">{label}</span>
      {caption && <small className="mt-1 block text-muted-foreground">{caption}</small>}
    </Link>
  );
}
```

Other components must accept data via props and must not query Supabase directly.

- [ ] **Step 4: Re-run component tests**

Run: `npm test -- components/admin/dashboard/dashboard-components.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add components/admin/dashboard
git commit -m "feat: add modular dashboard widgets"
```

### Task 5: Expand the Dashboard View Model and Compose the Page

**Files:**
- Modify: `types/database.ts`
- Modify: `lib/data.ts`
- Modify: `lib/admin-data.ts`
- Modify: `app/admin/page.tsx`
- Create: `lib/dashboard.test.ts`

- [ ] **Step 1: Write a failing view-model test**

Extract a pure formatter in `lib/dashboard.ts` and test stable output:

```ts
expect(buildDashboardCards({ news: 4, published: 3, documents: 5, albums: 2, services: 6, staff: 8, pageViews: 10 }))
  .toMatchObject([
    { label: "ข่าวทั้งหมด", value: 4, href: "/admin/news" },
    { label: "เอกสารดาวน์โหลด", value: 5, href: "/admin/documents" },
  ]);
```

- [ ] **Step 2: Run and verify failure**

Run: `npm test -- lib/dashboard.test.ts`

Expected: FAIL because `buildDashboardCards` is missing.

- [ ] **Step 3: Add types and queries**

Add types:

```ts
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string | null;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  actor?: Pick<Profile, "full_name" | "email"> | null;
}

export interface AnalyticsDaily {
  date: string;
  path: string;
  page_views: number;
}
```

Add `adminListRecentAudit(limit)`, `adminListStaff()`, and `adminListAnalytics(days)` in `lib/admin-data.ts`; return empty arrays on connection failure.

- [ ] **Step 4: Compose `app/admin/page.tsx`**

Fetch in one `Promise.all`, then pass results to presentational components:

```tsx
const [stats, news, documents, staff, activity, analytics] = await Promise.all([
  getDashboardStats(),
  adminListNews(),
  adminListDocuments(),
  adminListStaff(),
  adminListRecentAudit(6),
  adminListAnalytics(30),
]);
```

The page must use the approved grid, contain real links, and show explicit unavailable/empty states rather than fake numbers.

- [ ] **Step 5: Run all checks**

```powershell
npm test
npm run lint
npm run build
```

Expected: all tests pass, lint has no errors, build exits 0.

- [ ] **Step 6: Commit milestone 1**

```powershell
git add app/admin/page.tsx lib/data.ts lib/admin-data.ts lib/dashboard.ts lib/dashboard.test.ts types/database.ts
git commit -m "feat: compose live admin dashboard"
```

## Milestone 1 Acceptance

- Desktop shows permanent navy/gold sidebar.
- Tablet and mobile show hamburger/Sheet, never an icon-only collapsed sidebar.
- Dashboard widgets render real Supabase values or honest empty states.
- Existing admin authorization remains in `app/admin/layout.tsx`.
- Tests, lint, and production build pass.
