"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, GraduationCap, LogOut, ExternalLink } from "lucide-react";
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
    <nav className="flex flex-col gap-1 p-3" aria-label="เมนูหลังบ้าน">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item.href)
              ? "bg-sidebar-accent text-sidebar-primary"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
    <Link href="/admin" className="flex items-center gap-3 border-b border-sidebar-border px-5 py-4">
      <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-white">กลุ่มบริหารงานทั่วไป</span>
        <span className="block text-xs text-sidebar-foreground/60">ระบบจัดการหลังบ้าน</span>
      </span>
    </Link>
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
    <div className="min-h-dvh bg-muted/40 lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col bg-sidebar lg:flex">
        <SidebarBrand />
        <div className="flex-1 overflow-y-auto">
          <NavLinks role={role} />
        </div>
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-gold"
          >
            <ExternalLink className="size-4" aria-hidden /> ดูเว็บไซต์
          </Link>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="เปิดเมนู">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-0">
                <SheetTitle className="sr-only">เมนูหลังบ้าน</SheetTitle>
                <SidebarBrand />
                <NavLinks role={role} onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="font-semibold text-foreground">หลังบ้าน</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 transition-colors hover:bg-accent">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
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

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
