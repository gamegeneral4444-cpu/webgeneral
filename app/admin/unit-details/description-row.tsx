"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateUnitDescription } from "@/lib/actions/unit-details";

export function DescriptionRow({
  slug,
  label,
  initial,
  fallback,
}: {
  slug: string;
  label: string;
  /** ข้อความที่แอดมินแก้ไว้ในฐานข้อมูล */
  initial: string;
  /** ข้อความสำรองในโค้ด ใช้เมื่อช่องนี้ว่าง */
  fallback?: string;
}) {
  const [value, setValue] = useState(initial || fallback || "");
  const [saved, setSaved] = useState(initial || fallback || "");
  const [pending, startTransition] = useTransition();
  const dirty = value !== saved;

  function onSave() {
    startTransition(async () => {
      const res = await updateUnitDescription(slug, value);
      if (res.ok) {
        setSaved(value);
        toast.success(`บันทึกคำอธิบาย${label}แล้ว`);
      } else {
        toast.error(res.error ?? "บันทึกไม่สำเร็จ");
      }
    });
  }

  return (
    <div className="space-y-2 rounded-xl border border-[var(--admin-border)] bg-card p-4">
      <label htmlFor={`desc-${slug}`} className="block font-medium text-foreground">
        {label}
      </label>
      <Textarea
        id={`desc-${slug}`}
        rows={3}
        maxLength={2000}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ยังไม่มีคำอธิบาย"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {dirty ? "ยังไม่ได้บันทึก" : "บันทึกแล้ว"}
        </span>
        <Button type="button" size="sm" onClick={onSave} disabled={pending || !dirty}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          บันทึก
        </Button>
      </div>
    </div>
  );
}
