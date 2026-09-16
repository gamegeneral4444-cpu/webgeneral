import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserRound } from "lucide-react";
import { getStaffImageSrc, getStaffImageStyle } from "@/lib/staff-image";
import type { Staff } from "@/types/database";

export function RecentStaff({ rows }: { rows: Staff[] }) {
  return (
    <section className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm" aria-labelledby="recent-staff-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="recent-staff-title" className="font-bold text-[var(--admin-ink)]">บุคลากร</h2>
        <Link href="/admin/staff" className="inline-flex items-center gap-1 text-xs text-[var(--admin-gold)] hover:underline">ดูทั้งหมด <ArrowRight className="size-3" aria-hidden /></Link>
      </div>
      {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลบุคลากร</p> : (
        <ul className="divide-y divide-slate-100">
          {rows.slice(0, 4).map((staff) => (
            <li key={staff.id} className="flex items-center gap-3 py-3">
              <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-slate-500">
                {staff.image_url ? (
                  <Image
                    src={getStaffImageSrc(staff)}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                    style={getStaffImageStyle(staff)}
                  />
                ) : (
                  <UserRound className="size-5" aria-hidden />
                )}
              </span>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-[var(--admin-ink)]">{staff.full_name}</p><p className="truncate text-xs text-muted-foreground">{staff.position}</p></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
