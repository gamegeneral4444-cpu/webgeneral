"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UNITS } from "@/lib/units";

/**
 * เมนู "งานในฝ่าย" บนแถบหัวเว็บ (เฉพาะจอใหญ่)
 *
 * แยกเป็นสองส่วนโดยตั้งใจ: กดที่ชื่อ = ไปหน้ารวม /units, กดลูกศร = กางรายการ 14 งาน
 * ทำให้หน้ารวมไม่ถูกปิดทางเข้า และไม่ใช้ hover เปิดเพราะใช้บนจอสัมผัสไม่ได้
 */
export function UnitsNav({ active }: { active: boolean }) {
  return (
    <span className="relative flex items-center">
      <Link
        href="/units"
        className={cn(
          "rounded-md py-2 pl-3 pr-1 text-sm font-medium transition-colors hover:text-gold-light",
          active ? "text-gold-light" : "text-white/85",
        )}
      >
        งานในฝ่าย
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="กางรายการงานในฝ่าย"
          className="rounded-md py-2 pr-2 text-white/75 transition-colors hover:text-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-open:text-gold-light"
        >
          <ChevronDown className="size-4 transition-transform data-open:rotate-180" aria-hidden />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[34rem] max-w-[calc(100vw-2rem)] p-2">
          <DropdownMenuItem asChild>
            <Link href="/units" className="cursor-pointer font-medium text-primary">
              ดูภาพรวมทั้ง {UNITS.length} งาน
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
            {UNITS.map((u) => (
              <DropdownMenuItem key={u.slug} asChild>
                <Link
                  href={`/units/${u.slug}`}
                  className="cursor-pointer items-start gap-2 whitespace-normal leading-snug"
                >
                  <u.icon className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
                  <span>{u.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {active && (
        <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" aria-hidden />
      )}
    </span>
  );
}

/**
 * รุ่นสำหรับเมนูสไลด์บนมือถือ — ใช้ details/summary แทน dropdown
 * เปิดปิดได้ด้วยคีย์บอร์ดโดยไม่ต้องเขียน JS เอง และไม่มีปัญหาเรื่องจอสัมผัส
 */
export function UnitsNavMobile({
  active,
  onNavigate,
}: {
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <details className="group rounded-md">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
          active ? "bg-accent text-primary" : "text-foreground",
        )}
      >
        งานในฝ่าย
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
      </summary>

      <div className="mt-1 flex flex-col gap-0.5 border-l-2 border-gold/40 pl-2">
        <Link
          href="/units"
          onClick={onNavigate}
          className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
        >
          ดูภาพรวมทั้ง {UNITS.length} งาน
        </Link>
        {UNITS.map((u) => (
          <Link
            key={u.slug}
            href={`/units/${u.slug}`}
            onClick={onNavigate}
            className="flex items-start gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <u.icon className="mt-0.5 size-4 shrink-0 text-gold-dark" aria-hidden />
            <span className="leading-snug">{u.label}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
