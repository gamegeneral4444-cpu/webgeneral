"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  const total = points.reduce((sum, [, value]) => sum + value, 0);
  const chartData = points.map(([date, views]) => ({ date, views }));

  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-5 shadow-sm" aria-labelledby="analytics-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 id="analytics-title" className="font-bold text-[var(--admin-ink)]">สถิติการเข้าชมเว็บไซต์</h2><p className="mt-1 text-xs text-muted-foreground">ข้อมูลรวม {points.length} วันล่าสุด</p></div>
        <p className="text-right"><strong className="block text-2xl text-[var(--admin-ink)]">{total.toLocaleString("th-TH")}</strong><span className="text-xs text-muted-foreground">ครั้ง</span></p>
      </div>
      <div className="mt-6 h-56" aria-label={`ยอดเข้าชมรวม ${total} ครั้ง`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value) => [`${Number(value).toLocaleString("th-TH")} ครั้ง`, "ยอดเข้าชม"]} />
            <Bar dataKey="views" fill="var(--admin-gold)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">{chartData.map((point) => `${point.date} ${point.views} ครั้ง`).join(", ")}</p>
    </section>
  );
}
