import type { Metadata } from "next";
import { StaffCard } from "@/components/public/staff-card";
import { EmptyState } from "@/components/public/section";
import { PageHero } from "@/components/public/page-hero";
import { getStaff } from "@/lib/data";

export const metadata: Metadata = { title: "บุคลากร" };
export const revalidate = 300;

export default async function StaffPage() {
  const staff = await getStaff();
  return (
    <>
      <PageHero
        title="บุคลากรกลุ่มบริหารงานทั่วไป"
        subtitle="ทีมงานผู้พร้อมให้บริการและดูแลงานบริหารทั่วไป"
        crumbs={[{ label: "บุคลากร" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {staff.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {staff.map((s) => (
              <StaffCard key={s.id} staff={s} />
            ))}
          </div>
        ) : (
          <EmptyState title="ยังไม่มีข้อมูลบุคลากร" />
        )}
      </div>
    </>
  );
}
