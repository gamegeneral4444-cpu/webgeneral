"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, Mail, MapPin, Search } from "lucide-react";
import { FacebookIcon, LineIcon, YoutubeIcon } from "@/components/brand-icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { UnitsNav, UnitsNavMobile } from "@/components/public/units-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { PUBLIC_NAV } from "@/lib/constants";
import type { SiteSettings } from "@/types/database";

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const siteName = settings?.site_name ?? "ฝ่ายบริหารทั่วไป";
  const schoolName = settings?.school_name ?? "โรงเรียนตัวอย่างวิทยา";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar — กรมท่าเข้ม */}
      <div className="bg-navy-deep text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <div className="flex items-center gap-4 overflow-hidden">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 hover:text-gold-light">
                <Phone className="size-3.5" aria-hidden /> {settings.phone}
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="hidden items-center gap-1.5 hover:text-gold-light sm:inline-flex">
                <Mail className="size-3.5" aria-hidden /> {settings.email}
              </a>
            )}
            {settings?.address && (
              <span className="hidden items-center gap-1.5 lg:inline-flex">
                <MapPin className="size-3.5" aria-hidden /> {settings.address}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden sm:inline">ติดตามเรา :</span>
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-6 place-items-center rounded-full bg-white text-[#1877F2] transition-transform hover:scale-110">
                <FacebookIcon className="size-3.5" />
              </a>
            )}
            <span aria-label="LINE" className="grid size-6 place-items-center rounded-full bg-white text-[#06C755]">
              <LineIcon className="size-3.5" />
            </span>
            <span aria-label="YouTube" className="grid size-6 place-items-center rounded-full bg-white text-[#FF0000]">
              <YoutubeIcon className="size-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Main header — กระจกเงาพื้นกรมท่า ลอยทับเนื้อหาตอนเลื่อน */}
      <div className="glass-navy border-b-[3px] border-gold text-white">
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            {/* แผ่นกระจกมุมมน — ไม่ตัดฟันเฟืองรอบตราเหมือนกรอบวงกลม */}
            <span className="glass-mirror-soft glass-edge-gold grid size-12 shrink-0 place-items-center rounded-xl">
              <Image
                src={settings?.logo_url || "/logo.png"}
                alt={siteName}
                width={40}
                height={40}
                className="size-10 object-contain"
                priority
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold sm:text-xl">{siteName}</span>
              <span className="text-xs text-gold-light">{schoolName}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="เมนูหลัก">
            {PUBLIC_NAV.map((item) =>
              item.href === "/units" ? (
                <UnitsNav key={item.href} active={isActive(item.href)} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-gold-light",
                    isActive(item.href) ? "text-gold-light" : "text-white/85",
                  )}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" aria-hidden />
                  )}
                </Link>
              ),
            )}
            <Link
              href="/news"
              aria-label="ค้นหา"
              className="ml-1 grid size-9 place-items-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-gold-light"
            >
              <Search className="size-5" aria-hidden />
            </Link>
            <ThemeToggle className="text-white/75 hover:bg-white/10 hover:text-gold-light" />
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle className="text-white/75 hover:bg-white/10 hover:text-gold-light" />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="เปิดเมนู"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-gold-light"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="px-4 pt-4 text-base">{siteName}</SheetTitle>
                <nav className="mt-2 flex flex-col gap-1 p-2" aria-label="เมนูมือถือ">
                  {PUBLIC_NAV.map((item) =>
                    item.href === "/units" ? (
                      <UnitsNavMobile
                        key={item.href}
                        active={isActive(item.href)}
                        onNavigate={() => setOpen(false)}
                      />
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                          isActive(item.href) ? "bg-accent text-primary" : "text-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                  <Button asChild className="mt-2">
                    <Link href="/login" onClick={() => setOpen(false)}>
                      เข้าสู่ระบบภายใน
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
