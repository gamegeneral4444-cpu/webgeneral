"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ปุ่มสลับโหมดสว่าง/มืด
 *
 * next-themes อ่านค่าจริงได้หลัง mount เท่านั้น ก่อนหน้านั้นจึงเรนเดอร์กล่องเปล่า
 * ขนาดเท่ากันไว้กันเลย์เอาต์กระตุก และกัน hydration mismatch
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    return <span className={cn("size-9", className)} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={isDark ? "โหมดสว่าง" : "โหมดมืด"}
      className={cn(
        "grid size-9 place-items-center rounded-full transition-colors",
        "text-current/70 hover:bg-accent hover:text-primary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
    >
      {isDark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </button>
  );
}
