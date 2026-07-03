"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, Mail, MapPin, Search, GraduationCap } from "lucide-react";
import { FacebookIcon, LineIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { PUBLIC_NAV } from "@/lib/constants";
import type { SiteSettings } from "@/types/database";

export function SiteHeader({ settings }: { settings: SiteSettings | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const siteName = settings?.site_name ?? "กลุ่มบริหารงานทั่วไป";
  const schoolName = settings?.school_name ?? "โรงเรียนตัวอย่างวิทยา";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top bar — โทนทอง */}
      <div className="bg-gradient-to-r from-primary to-[#d97706] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <div className="flex items-center gap-4 overflow-hidden">
            {settings?.phone && (
              <a href={`tel:${settings.phone}`} className="inline-flex items-center gap-1.5 hover:text-amber-100">
                <Phone className="size-3.5" aria-hidden /> {settings.phone}
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="hidden items-center gap-1.5 hover:text-amber-100 sm:inline-flex">
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

      {/* Main header — พื้นขาว */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid size-12 place-items-center overflow-hidden rounded-full bg-soft-gold text-primary shadow-sm ring-2 ring-gold/40">
              {settings?.logo_url ? (
                <Image
                  src={settings.logo_url}
                  alt={siteName}
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              ) : (
                <GraduationCap className="size-6" aria-hidden />
              )}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-[#0f172a] sm:text-xl">{siteName}</span>
              <span className="text-xs text-muted-foreground">{schoolName}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="เมนูหลัก">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.href) ? "text-primary" : "text-[#0f172a]/80",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" aria-hidden />
                )}
              </Link>
            ))}
            <Link
              href="/news"
              aria-label="ค้นหา"
              className="ml-1 grid size-9 place-items-center rounded-full text-[#0f172a]/70 transition-colors hover:bg-accent hover:text-primary"
            >
              <Search className="size-5" aria-hidden />
            </Link>
          </nav>

          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="เปิดเมนู">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="px-4 pt-4 text-base">{siteName}</SheetTitle>
                <nav className="mt-2 flex flex-col gap-1 p-2" aria-label="เมนูมือถือ">
                  {PUBLIC_NAV.map((item) => (
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
                  ))}
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
