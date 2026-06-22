import type { Metadata } from "next";
import { ServiceCard } from "@/components/public/service-card";
import { EmptyState } from "@/components/public/section";
import { PageHero } from "@/components/public/page-hero";
import { getServices } from "@/lib/data";

export const metadata: Metadata = { title: "ระบบบริการออนไลน์" };
export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        title="ระบบบริการออนไลน์"
        subtitle="บริการของกลุ่มบริหารงานทั่วไปที่เข้าถึงได้ทุกที่ ทุกเวลา"
        crumbs={[{ label: "ระบบบริการ" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        {services.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="ยังไม่มีระบบบริการ"
            description="เมื่อผู้ดูแลเพิ่มบริการแล้ว รายการจะแสดงที่นี่"
          />
        )}
      </div>
    </>
  );
}
