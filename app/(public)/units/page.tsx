import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { UNITS } from "@/lib/units";
import { getUnitPostCounts, getUnitStaffMap } from "@/lib/data";

export const metadata: Metadata = { title: "กลุ่มงาน" };
export const revalidate = 300;

export default async function UnitsPage() {
  const [counts, staffMap] = await Promise.all([getUnitPostCounts(), getUnitStaffMap()]);

  return (
    <>
      <PageHero
        title="กลุ่มงานในฝ่ายบริหารทั่วไป"
        subtitle={`โครงสร้างงานย่อยทั้ง ${UNITS.length} งาน พร้อมความคืบหน้าล่าสุดของแต่ละงาน`}
        crumbs={[{ label: "กลุ่มงาน" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UNITS.map((u) => {
            const count = counts[u.slug] ?? 0;
            const heads = staffMap[u.slug]?.head ?? [];
            return (
              <Link
                key={u.slug}
                href={`/units/${u.slug}`}
                className="group flex flex-col gap-3 rounded-xl border border-t-2 border-t-gold bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <u.icon className="size-6" aria-hidden />
                </span>
                <span className="font-medium text-foreground group-hover:text-primary">
                  {u.label}
                </span>
                <span className="text-sm text-muted-foreground">
                  หัวหน้างาน :{" "}
                  {heads.length
                    ? heads.map((h) => h.full_name).join(" · ")
                    : "ยังไม่ได้ระบุ"}
                </span>
                <span className="mt-auto flex items-center gap-1 pt-1 text-sm font-medium text-primary">
                  {count > 0 ? `${count} รายการ` : "ยังไม่มีรายการ"}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
