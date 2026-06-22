import Link from "next/link";
import {
  ArrowRight,
  Download,
  Building2,
  Car,
  Wrench,
  Coffee,
  FileText,
  Headphones,
  Heart,
  ShieldCheck,
  Zap,
  Award,
  Users,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/public/news-card";
import { DocumentCard } from "@/components/public/document-card";
import { GalleryCard } from "@/components/public/gallery-card";
import { StaffCard } from "@/components/public/staff-card";
import { SectionHeading, EmptyState } from "@/components/public/section";
import {
  getPublishedNews,
  getDocuments,
  getAlbums,
  getStaff,
  getSettings,
} from "@/lib/data";

export const revalidate = 60;

const QUICK_SERVICES = [
  { icon: Building2, label: "ขอใช้อาคารสถานที่", href: "/services" },
  { icon: Car, label: "จองรถราชการ", href: "/services" },
  { icon: Wrench, label: "แจ้งซ่อม", href: "/services" },
  { icon: Coffee, label: "จองอาหารว่าง/เบรก", href: "/services" },
  { icon: FileText, label: "ดาวน์โหลดแบบฟอร์ม", href: "/downloads" },
  { icon: Headphones, label: "ติดต่อฝ่ายงานทั่วไป", href: "/contact" },
];

const CORE_VALUES = [
  { icon: Heart, label: "บริการด้วยใจ" },
  { icon: ShieldCheck, label: "โปร่งใส" },
  { icon: Zap, label: "รวดเร็ว" },
  { icon: Award, label: "มุ่งสู่ความเป็นเลิศ" },
];

export default async function HomePage() {
  const [news, documents, albums, staff, settings] = await Promise.all([
    getPublishedNews({ limit: 3 }),
    getDocuments(),
    getAlbums(),
    getStaff(),
    getSettings(),
  ]);

  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-soft-gold via-amber-50/40 to-background">
        {/* ลายจุด */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(180,83,9,0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-96 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-24 pt-14 lg:grid-cols-2 lg:pb-28 lg:pt-20">
          {/* ซ้าย: ข้อความ */}
          <div>
            <h1 className="text-4xl font-bold leading-tight text-[#0f172a] sm:text-5xl">
              ยินดีต้อนรับสู่
              <span className="mt-1 block bg-gradient-to-r from-primary to-[#d97706] bg-clip-text text-5xl text-transparent sm:text-6xl">
                {settings?.site_name ?? "กลุ่มบริหารงานทั่วไป"}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              มุ่งมั่นให้บริการอย่างเป็นระบบ รวดเร็ว โปร่งใส และเป็นเลิศ
              เพื่อสนับสนุนการบริหารจัดการภายในโรงเรียนอย่างมีประสิทธิภาพ
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-md shadow-primary/20">
                <Link href="/services">
                  <Users className="size-4" aria-hidden /> เข้าสู่ระบบบริการ
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-background">
                <Link href="/downloads">
                  <Download className="size-4" aria-hidden /> ดาวน์โหลดเอกสาร
                </Link>
              </Button>
            </div>
          </div>

          {/* ขวา: ภาพประกอบอาคาร (illustration panel) */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-100 via-amber-50 to-emerald-50 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(250,204,21,0.25),transparent_55%)]" aria-hidden />
              {/* ท้องฟ้า + อาคาร */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-2 p-6">
                <div className="h-24 w-16 rounded-t-md bg-white/80 shadow-inner" />
                <div className="relative h-40 w-40 rounded-t-lg bg-white shadow-md">
                  <div className="absolute -top-7 left-1/2 h-7 w-1 -translate-x-1/2 bg-slate-400" aria-hidden />
                  <div className="absolute -top-7 left-1/2 h-4 w-6 -translate-x-[2px] bg-red-500" aria-hidden />
                  <Landmark className="mx-auto mt-4 size-14 text-primary" aria-hidden />
                  <div className="mt-2 grid grid-cols-3 gap-1.5 px-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="h-4 rounded-sm bg-sky-200" />
                    ))}
                  </div>
                </div>
                <div className="h-28 w-16 rounded-t-md bg-white/80 shadow-inner" />
              </div>
            </div>
          </div>
        </div>

        {/* เส้นโค้งทองด้านล่าง */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-r from-gold/40 via-primary/30 to-transparent"
          style={{ clipPath: "ellipse(80% 100% at 70% 100%)" }}
          aria-hidden
        />

        {/* การ์ดค่านิยมลอย */}
        <div className="relative mx-auto -mb-10 max-w-5xl px-4">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:grid-cols-4">
            {CORE_VALUES.map((v) => (
              <div key={v.label} className="flex items-center gap-3 rounded-xl px-3 py-2">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-soft-gold text-primary ring-1 ring-primary/10">
                  <v.icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-[#0f172a]">{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== บริการด่วน ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-20">
        <SectionHeading title="บริการด่วน" subtitle="เข้าถึงบริการที่ใช้บ่อยได้ทันที" moreHref="/services" moreLabel="ดูบริการทั้งหมด" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_SERVICES.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
            >
              <span className="grid size-14 place-items-center rounded-xl bg-soft-gold text-primary ring-1 ring-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="size-7" aria-hidden />
              </span>
              <span className="text-sm font-medium text-[#0f172a] group-hover:text-primary">
                {s.label}
              </span>
              <span className="h-0.5 w-8 rounded-full bg-gold transition-all group-hover:w-12" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== ข่าวประชาสัมพันธ์ ===== */}
      <section className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeading
            title="ข่าวประชาสัมพันธ์"
            subtitle="ติดตามข่าวสารและประกาศจากกลุ่มบริหารงานทั่วไป"
            moreHref="/news"
            moreLabel="ดูข่าวทั้งหมด"
          />
          {news.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((n) => (
                <NewsCard key={n.id} news={n} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="ยังไม่มีข่าวประชาสัมพันธ์"
              description="เมื่อเชื่อมต่อฐานข้อมูลและเพิ่มข่าวแล้ว ข่าวจะแสดงที่นี่"
            />
          )}
        </div>
      </section>

      {/* ===== เอกสารดาวน์โหลด ===== */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="เอกสารดาวน์โหลด"
          subtitle="แบบฟอร์ม คำสั่ง ระเบียบ และคู่มือต่าง ๆ"
          moreHref="/downloads"
          moreLabel="ดูทั้งหมด"
        />
        {documents.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {documents.slice(0, 4).map((d) => (
              <DocumentCard key={d.id} doc={d} />
            ))}
          </div>
        ) : (
          <EmptyState title="ยังไม่มีเอกสาร" />
        )}
      </section>

      {/* ===== ภาพกิจกรรม ===== */}
      {albums.length > 0 && (
        <section className="bg-muted/40 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeading title="ภาพกิจกรรม" subtitle="บรรยากาศกิจกรรมต่าง ๆ" moreHref="/gallery" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {albums.slice(0, 3).map((a) => (
                <GalleryCard key={a.id} album={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== บุคลากร ===== */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <SectionHeading
          title="บุคลากรกลุ่มบริหารงานทั่วไป"
          subtitle="ทีมงานผู้พร้อมให้บริการ"
          moreHref="/staff"
          moreLabel="ดูบุคลากรทั้งหมด"
        />
        {staff.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {staff.slice(0, 4).map((s) => (
              <StaffCard key={s.id} staff={s} showDetailButton />
            ))}
          </div>
        ) : (
          <EmptyState title="ยังไม่มีข้อมูลบุคลากร" />
        )}
      </section>

      {/* ===== Contact CTA ===== */}
      <section className="border-t bg-primary/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-[#0f172a]">ต้องการติดต่อกลุ่มบริหารงานทั่วไป?</h2>
          <p className="max-w-xl text-muted-foreground">
            สอบถามข้อมูล แจ้งเรื่อง หรือขอรับบริการต่าง ๆ ได้ตามช่องทางด้านล่าง
          </p>
          <Button asChild size="lg">
            <Link href="/contact">
              ช่องทางติดต่อ <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
