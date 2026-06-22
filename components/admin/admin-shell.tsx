"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, Landmark, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { visibleNav } from "@/components/admin/admin-nav";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { logoutAction } from "@/lib/actions/auth";

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = visibleNav(role);
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="flex flex-col gap-1.5 px-3 py-4" aria-label="เมนูหลังบ้าน">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-gradient-to-r from-[var(--admin-gold)] to-[var(--admin-gold-bright)] text-[var(--admin-navy-strong)] shadow-sm"
              : "text-white/78 hover:bg-white/8 hover:text-white",
          )}
        >
          <item.icon className="size-5 shrink-0" aria-hidden />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
      <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-[var(--admin-gold-bright)] bg-white/5 text-[var(--admin-gold-bright)] shadow-inner">
        <Landmark className="size-6" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-base font-bold text-white">Admin Dashboard</span>
        <span className="mt-1 block text-xs text-white/65">กลุ่มบริหารงานทั่วไป</span>
      </span>
    </Link>
  );
}

function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <NavLinks role={role} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          onClick={onNavigate}
          className="flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-[var(--admin-gold-bright)]"
        >
          <ExternalLink className="size-4" aria-hidden />
          ดูเว็บไซต์จริง
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({
  role,
  fullName,
  email,
  children,
}: {
  role: Role;
  fullName: string;
  email: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const initials = (fullName || email || "A").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-dvh bg-[var(--admin-surface)] lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col overflow-hidden bg-[var(--admin-navy)] lg:flex">
        <SidebarBrand />
        <SidebarContent role={role} />
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[var(--admin-border)] text-[var(--admin-ink)] lg:hidden"
                  aria-label="เปิดเมนู"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                aria-describedby={undefined}
                className="w-72 gap-0 border-r-0 bg-[var(--admin-navy)] p-0 text-white"
              >
                <SheetTitle className="sr-only">เมนูหลังบ้าน</SheetTitle>
                <SidebarBrand />
                <SidebarContent role={role} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="leading-tight">
              <p className="text-xs font-medium text-[var(--admin-gold)]">หน้าหลัก</p>
              <p className="text-sm font-semibold text-[var(--admin-ink)]">แผงควบคุมระบบ</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="เปิดเมนูบัญชีผู้ใช้"
                className="flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-white py-1 pl-1 pr-2 transition-colors hover:bg-amber-50 sm:pr-3"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[var(--admin-navy)] text-sm text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight text-foreground">
                    {fullName || "ผู้ดูแล"}
                  </span>
                  <span className="block text-xs leading-tight text-muted-foreground">
                    {ROLE_LABELS[role]}
                  </span>
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{fullName || "ผู้ดูแล"}</p>
                <p className="text-xs font-normal text-muted-foreground">{email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={logoutAction}>
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="text-destructive focus:text-destructive" asChild>
                    <span className="flex cursor-pointer items-center gap-2">
                      <LogOut className="size-4" aria-hidden /> ออกจากระบบ
                    </span>
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 xl:p-7">{children}</main>
      </div>
    </div>
  );
}
