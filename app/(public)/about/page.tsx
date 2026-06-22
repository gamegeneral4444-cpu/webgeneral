import type { Metadata } from "next";
import {
  Building2,
  Car,
  Megaphone,
  FileStack,
  HeartPulse,
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
  Target,
  Eye,
} from "lucide-react";
import { PageHero } from "@/components/public/page-hero";

export const metadata: Metadata = { title: "เกี่ยวกับเรา" };
export const revalidate = 3600;

const SCOPE = [
  { icon: Building2, label: "งานอาคารสถานที่" },
  { icon: Car, label: "งานยานพาหนะ" },
  { icon: Megaphone, label: "งานประชาสัมพันธ์" },
  { icon: FileStack, label: "งานสารบรรณ" },
  { icon: HeartPulse, label: "งานอนามัยโรงเรียน" },
  { icon: UtensilsCrossed, label: "งานโภชนาการ" },
  { icon: ShieldCheck, label: "งานรักษาความปลอดภัย" },
  { icon: Sparkles, label: "งานบริการทั่วไป" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="เกี่ยวกับกลุ่มบริหารงานทั่วไป"
        subtitle="วิสัยทัศน์ พันธกิจ และขอบข่ายงานของกลุ่มบริหารงานทั่วไป"
        crumbs={[{ label: "เกี่ยวกับเรา" }]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-soft-gold text-primary">
                <Eye className="size-6" aria-hidden />
              </span>
              <h2 className="text-xl font-bold text-foreground">วิสัยทัศน์</h2>
            </div>
            <p className="mt-4 text-muted-foreground">
              เป็นหน่วยงานสนับสนุนการบริหารจัดการของโรงเรียนที่มีประสิทธิภาพ
              ให้บริการด้วยความรวดเร็ว โปร่งใส และมุ่งสู่ความเป็นเลิศ
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-soft-gold text-primary">
                <Target className="size-6" aria-hidden />
              </span>
              <h2 className="text-xl font-bold text-foreground">พันธกิจ</h2>
            </div>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>• สนับสนุนงานบริหารทั่วไปให้ดำเนินไปอย่างมีระบบ</li>
              <li>• พัฒนาการให้บริการแก่ครู บุคลากร นักเรียน และผู้ปกครอง</li>
              <li>• นำเทคโนโลยีมาใช้เพื่อลดขั้นตอนและเอกสารกระดาษ</li>
              <li>• ดูแลอาคารสถานที่และสภาพแวดล้อมให้ปลอดภัย น่าอยู่</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-1 h-1 w-12 rounded-full bg-gold" aria-hidden />
          <h2 className="text-2xl font-bold text-foreground">ขอบข่ายงาน</h2>
          <p className="mt-1 text-muted-foreground">งานในความรับผิดชอบของกลุ่มบริหารงานทั่วไป</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {SCOPE.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10">
                  <s.icon className="size-6" aria-hidden />
                </span>
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
