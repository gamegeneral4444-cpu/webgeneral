"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unitPostSchema } from "@/lib/validations";
import { UNITS } from "@/lib/units";
import { createUnitPost, updateUnitPost } from "@/lib/actions/unit-posts";
import { MultiUploader } from "@/components/admin/multi-uploader";
import { BUCKETS } from "@/lib/constants";
import { useState } from "react";
import type { UnitPost, UnitPostFile } from "@/types/database";

type FormValues = z.input<typeof unitPostSchema>;

function toFormData(v: FormValues): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function UnitPostForm({ initial }: { initial?: UnitPost }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [files, setFiles] = useState<UnitPostFile[]>(initial?.attachments ?? []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(unitPostSchema),
    defaultValues: {
      unit_slug: initial?.unit_slug ?? UNITS[0].slug,
      title: initial?.title ?? "",
      body: initial?.body ?? "",
      status: initial?.status ?? "draft",
      posted_at: initial?.posted_at ? initial.posted_at.slice(0, 10) : "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = toFormData(values);
      fd.set("attachments", JSON.stringify(files));
      const res = initial ? await updateUnitPost(initial.id, fd) : await createUnitPost(fd);
      if (!res.ok) {
        toast.error(res.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      toast.success("บันทึกแล้ว");
      router.push("/admin/unit-posts");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-5 rounded-xl border border-[var(--admin-border)] bg-card p-6"
    >
      <div className="space-y-2">
        <Label htmlFor="unit_slug">งาน</Label>
        <Select value={watch("unit_slug")} onValueChange={(v) => setValue("unit_slug", v)}>
          <SelectTrigger id="unit_slug">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNITS.map((u) => (
              <SelectItem key={u.slug} value={u.slug}>
                {u.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.unit_slug && (
          <p className="text-sm text-destructive">{errors.unit_slug.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">หัวข้อ</Label>
        <Input id="title" maxLength={255} placeholder="เช่น ซ่อมหลังคาอาคาร 2" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">รายละเอียด</Label>
        <Textarea id="body" rows={8} placeholder="ความคืบหน้า ผลการดำเนินงาน หรือรายละเอียดอื่น ๆ" {...register("body")} />
        {errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>ไฟล์แนบ (ไม่บังคับ)</Label>
        <MultiUploader bucket={BUCKETS.siteAssets} value={files} onChange={setFiles} />
        <p className="text-xs text-muted-foreground">
          รูปภาพจะขึ้นเป็นแกลเลอรีกดขยายได้ ส่วนเอกสารจะขึ้นเป็นรายการให้กดดาวน์โหลด
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">สถานะ</Label>
          <Select
            value={watch("status")}
            onValueChange={(v) => setValue("status", v as FormValues["status"])}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">ฉบับร่าง</SelectItem>
              <SelectItem value="published">เผยแพร่</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="posted_at">วันที่ (ไม่บังคับ)</Label>
          <Input id="posted_at" type="date" {...register("posted_at")} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Save className="size-4" aria-hidden />
        )}
        บันทึก
      </Button>
    </form>
  );
}
