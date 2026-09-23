"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "@/components/lucide-icon";
import { createUnit, updateUnit, deleteUnit } from "@/lib/actions/units";
import type { UnitRow } from "@/types/database";

type Draft = {
  slug: string;
  label: string;
  icon: string;
  description: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY: Draft = {
  slug: "",
  label: "",
  icon: "HelpCircle",
  description: "",
  sort_order: 99,
  is_active: true,
};

function Fields({
  draft,
  setDraft,
  lockSlug,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  lockSlug: boolean;
}) {
  const id = draft.slug || "new";
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`label-${id}`}>ชื่อกลุ่มงาน</Label>
          <Input
            id={`label-${id}`}
            value={draft.label}
            maxLength={255}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`slug-${id}`}>รหัสงาน (ใช้เป็นลิงก์)</Label>
          <Input
            id={`slug-${id}`}
            value={draft.slug}
            disabled={lockSlug}
            placeholder="เช่น building"
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            {lockSlug
              ? "แก้ไม่ได้ เพราะรายการงานและผู้รับผิดชอบอ้างถึงรหัสนี้"
              : "ใช้ a-z 0-9 และขีดกลาง ตั้งแล้วเปลี่ยนไม่ได้"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem_auto]">
        <div className="space-y-1.5">
          <Label htmlFor={`icon-${id}`}>ไอคอน</Label>
          <div className="flex items-center gap-2">
            <Input
              id={`icon-${id}`}
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
            />
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-soft-gold text-primary ring-1 ring-primary/10">
              <LucideIcon name={draft.icon} className="size-5" aria-hidden />
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            พิมพ์ชื่อไอคอนจาก{" "}
            <a
              href="https://lucide.dev/icons/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              lucide.dev
            </a>{" "}
            เช่น Building2, Car — ถ้าชื่อผิดจะขึ้นเครื่องหมายคำถาม
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`sort-${id}`}>ลำดับ</Label>
          <Input
            id={`sort-${id}`}
            type="number"
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <Switch
            id={`active-${id}`}
            checked={draft.is_active}
            onCheckedChange={(v) => setDraft({ ...draft, is_active: v })}
          />
          <Label htmlFor={`active-${id}`}>แสดงบนเว็บ</Label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`desc-${id}`}>หน้าที่และความรับผิดชอบ</Label>
        <Textarea
          id={`desc-${id}`}
          rows={3}
          maxLength={2000}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>
    </div>
  );
}

export function UnitEditor({
  rows,
  usage,
}: {
  rows: UnitRow[];
  usage: Record<string, { posts: number; staff: number }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>(EMPTY);

  function onCreate() {
    startTransition(async () => {
      const res = await createUnit(newDraft);
      if (!res.ok) {
        toast.error(res.error ?? "เพิ่มไม่สำเร็จ");
        return;
      }
      toast.success("เพิ่มกลุ่มงานแล้ว");
      setNewDraft(EMPTY);
      setAdding(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {adding ? (
        <div className="space-y-4 rounded-xl border-2 border-dashed border-primary/40 bg-card p-5">
          <h2 className="font-bold text-foreground">เพิ่มกลุ่มงานใหม่</h2>
          <Fields draft={newDraft} setDraft={setNewDraft} lockSlug={false} />
          <div className="flex gap-2">
            <Button onClick={onCreate} disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              เพิ่ม
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)} disabled={pending}>
              ยกเลิก
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setAdding(true)} className="gap-2">
          <Plus className="size-4" /> เพิ่มกลุ่มงาน
        </Button>
      )}

      {rows.map((row) => (
        <UnitCard key={row.slug} row={row} usage={usage[row.slug]} />
      ))}
    </div>
  );
}

function UnitCard({
  row,
  usage,
}: {
  row: UnitRow;
  usage?: { posts: number; staff: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft>({
    slug: row.slug,
    label: row.label,
    icon: row.icon,
    description: row.description,
    sort_order: row.sort_order,
    is_active: row.is_active,
  });

  const posts = usage?.posts ?? 0;
  const staff = usage?.staff ?? 0;
  const inUse = posts > 0 || staff > 0;

  function onSave() {
    startTransition(async () => {
      const res = await updateUnit(row.slug, draft);
      if (!res.ok) {
        toast.error(res.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      toast.success("บันทึกแล้ว");
      router.refresh();
    });
  }

  function onDelete() {
    startTransition(async () => {
      const res = await deleteUnit(row.slug);
      if (!res.ok) {
        toast.error(res.error ?? "ลบไม่สำเร็จ");
        return;
      }
      toast.success("ลบกลุ่มงานแล้ว");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--admin-border)] bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-bold text-foreground">
          <LucideIcon name={row.icon} className="size-5 text-gold-dark" aria-hidden />
          {row.label}
          {!row.is_active && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              ซ่อนอยู่
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {posts} รายการ · ผู้รับผิดชอบ {staff} คน
        </span>
      </div>

      <Fields draft={draft} setDraft={setDraft} lockSlug />

      <div className="flex flex-wrap gap-2">
        <Button onClick={onSave} disabled={pending} size="sm">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          บันทึก
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={pending || inUse}
          title={inUse ? "ลบไม่ได้เพราะยังมีข้อมูลผูกอยู่ ให้ปิด “แสดงบนเว็บ” แทน" : undefined}
          className="gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" /> ลบถาวร
        </Button>
        {inUse && (
          <span className="self-center text-xs text-muted-foreground">
            ลบถาวรไม่ได้เพราะยังมีข้อมูลผูกอยู่ — ปิด &quot;แสดงบนเว็บ&quot; เพื่อซ่อนแทน
          </span>
        )}
      </div>
    </div>
  );
}
