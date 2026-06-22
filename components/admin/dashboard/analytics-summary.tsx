import type { AnalyticsDaily } from "@/types/database";

export function AnalyticsSummary({ rows }: { rows: AnalyticsDaily[] }) {
  if (rows.length === 0) {
    return (
      <section className="rounded-xl border border-[var(--admin-border)] bg-white p-5 shadow-sm" aria-labelledby="analytics-title">
        <h2 id="analytics-title" className="font-bold text-[var(--admin-ink)]">สถิติการเข้าชมเว็บไซต์</h2>
        <p className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลการเข้าชม</p>
      </section>
    );
  }

  const totals = new Map<string, number>();
  for (const row of rows) totals.set(row.date, (totals.get(row.date) ?? 0) + row.page_views);
  const points = [...totals].sort(([left], [right]) => left.localeCompare(right));
  const max = Math.max(...points.map(([, value]) => value), 1);
  const total = points.reduce((sum, [, value]) => sum + value, 0);

  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-5 shadow-sm" aria-labelledby="analytics-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="analytics-title" className="font-bold text-[var(--admin-ink)]">สถิติการเข้าชมเว็บไซต์</h2><p className="mt-1 text-xs text-muted-foreground">ข้อมูลรวม {points.length} วันล่าสุด</p></div>
        <p className="text-right"><strong className="block text-2xl text-[var(--admin-ink)]">{total.toLocaleString("th-TH")}</strong><span className="text-xs text-muted-foreground">ครั้ง</span></p>
      </div>
      <div className="mt-6 flex h-36 items-end gap-1.5" aria-label={`ยอดเข้าชมรวม ${total} ครั้ง`}>
        {points.map(([date, value]) => (
          <div key={date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${date}: ${value} ครั้ง`}>
            <span className="w-full rounded-t-sm bg-gradient-to-t from-[var(--admin-gold)] to-[var(--admin-gold-bright)]" style={{ height: `${Math.max((value / max) * 100, 4)}%` }} />
          </div>
        ))}
      </div>
    </section>
  );
}
