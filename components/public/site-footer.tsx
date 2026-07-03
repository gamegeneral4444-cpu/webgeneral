import Link from "next/link";
import { Phone, Mail, MapPin, Clock, MapPinned } from "lucide-react";
import { FacebookIcon, LineIcon, YoutubeIcon } from "@/components/brand-icons";
import { safeHttpUrl } from "@/lib/social";
import type { SiteSettings } from "@/types/database";

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const siteName = settings?.site_name ?? "กลุ่มบริหารงานทั่วไป";
  const schoolName = settings?.school_name ?? "โรงเรียนตัวอย่างวิทยา";
  const facebookHref = safeHttpUrl(settings?.facebook_url);
  const lineValue = settings?.line_url?.trim() || "";
  const lineHref = safeHttpUrl(lineValue);
  const youtubeHref = safeHttpUrl(settings?.youtube_url);

  return (
    <footer className="mt-auto bg-[#0f172a] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3">
        {/* ติดต่อเรา */}
        <div>
          <h2 className="mb-4 text-base font-bold text-white">ติดต่อเรา</h2>
          <ul className="space-y-3 text-sm text-slate-400">
            {settings?.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
                <span>{settings.address}</span>
              </li>
            )}
            {settings?.phone && (
              <li className="flex gap-3">
                <Phone className="size-5 shrink-0 text-gold" aria-hidden />
                <a href={`tel:${settings.phone}`} className="hover:text-gold">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings?.email && (
              <li className="flex gap-3">
                <Mail className="size-5 shrink-0 text-gold" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-gold">
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.office_hours && (
              <li className="flex gap-3">
                <Clock className="size-5 shrink-0 text-gold" aria-hidden />
                <span>{settings.office_hours}</span>
              </li>
            )}
          </ul>
        </div>

        {/* ติดตามเรา */}
        <div>
          <h2 className="mb-4 text-base font-bold text-white">ติดตามเรา</h2>
          <ul className="space-y-3 text-sm">
            {facebookHref && (
              <li>
                <a
                  href={facebookHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-slate-400 transition-colors hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[#1877F2] text-white">
                    <FacebookIcon className="size-4" />
                  </span>
                  {schoolName}
                </a>
              </li>
            )}
            {lineValue && (
              <li>
                {lineHref ? (
                  <a
                    href={lineHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-slate-400 transition-colors hover:text-white"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-[#06C755] text-white">
                      <LineIcon className="size-4" />
                    </span>
                    {schoolName}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-3 text-slate-400">
                    <span className="grid size-8 place-items-center rounded-full bg-[#06C755] text-white">
                      <LineIcon className="size-4" />
                    </span>
                    {lineValue}
                  </span>
                )}
              </li>
            )}
            {youtubeHref && (
              <li>
                <a
                  href={youtubeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-slate-400 transition-colors hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[#FF0000] text-white">
                    <YoutubeIcon className="size-4" />
                  </span>
                  {schoolName}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* แผนที่ */}
        <div>
          <h2 className="mb-4 text-base font-bold text-white">แผนที่</h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            {settings?.map_embed_url ? (
              <iframe
                src={settings.map_embed_url}
                title="แผนที่"
                className="h-44 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="grid h-44 place-items-center bg-white/5 text-center text-sm text-slate-400">
                <div>
                  <MapPinned className="mx-auto mb-2 size-7 text-red-500" aria-hidden />
                  {schoolName}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* แถบลิขสิทธิ์ทอง */}
      <div className="bg-gradient-to-r from-primary to-[#d97706]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 text-center text-xs text-white sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} {schoolName} · {siteName} สงวนลิขสิทธิ์
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/about" className="hover:underline">
              ข้อกำหนดการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
