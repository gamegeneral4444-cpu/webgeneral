import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, MapPinned } from "lucide-react";
import { FacebookIcon } from "@/components/brand-icons";
import { PageHero } from "@/components/public/page-hero";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "ติดต่อเรา" };
export const revalidate = 300;

export default async function ContactPage() {
  const s = await getSettings();
  const items = [
    s?.address && { icon: MapPin, label: "ที่อยู่", value: s.address },
    s?.phone && { icon: Phone, label: "โทรศัพท์", value: s.phone, href: `tel:${s.phone}` },
    s?.email && { icon: Mail, label: "อีเมล", value: s.email, href: `mailto:${s.email}` },
    s?.office_hours && { icon: Clock, label: "เวลาทำการ", value: s.office_hours },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero
        title="ติดต่อเรา"
        subtitle="ช่องทางการติดต่อกลุ่มบริหารงานทั่วไป"
        crumbs={[{ label: "ติดต่อเรา" }]}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.label} className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-soft-gold text-primary">
                  <it.icon className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{it.label}</p>
                  {it.href ? (
                    <a href={it.href} className="font-medium text-foreground hover:text-primary">
                      {it.value}
                    </a>
                  ) : (
                    <p className="font-medium text-foreground">{it.value}</p>
                  )}
                </div>
              </div>
            ))}

            {s?.facebook_url && (
              <a
                href={s.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/30"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1877F2] text-white">
                  <FacebookIcon className="size-6" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">Facebook</p>
                  <p className="font-medium text-foreground">{s?.school_name ?? "เพจโรงเรียน"}</p>
                </div>
              </a>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {s?.map_embed_url ? (
              <iframe
                src={s.map_embed_url}
                title="แผนที่"
                className="h-full min-h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="grid h-full min-h-80 place-items-center bg-muted/40 text-center text-muted-foreground">
                <div>
                  <MapPinned className="mx-auto mb-2 size-9 text-red-500" aria-hidden />
                  {s?.school_name ?? "โรงเรียนตัวอย่างวิทยา"}
                  <p className="mt-1 text-xs">ตั้งค่าแผนที่ได้ในหน้าตั้งค่าเว็บไซต์</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
