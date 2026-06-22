"use client";

import { useState, useTransition } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Uploader } from "@/components/admin/uploader";
import { staffSchema, type StaffInput } from "@/lib/validations";
import { BUCKETS } from "@/lib/constants";
import { createStaff, updateStaff } from "@/lib/actions/staff";
import type { Staff } from "@/types/database";

type FormValues = z.input<typeof staffSchema>;

function toFormData(v: FormValues): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function StaffForm({ initial }: { initial?: Staff }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [image, setImage] = useState(initial?.image_url ?? "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, StaffInput>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      full_name: initial?.full_name ?? "",
      position: initial?.position ?? "",
      department: initial?.department ?? "กลุ่มบริหารงานทั่วไป",
      responsibility: initial?.responsibility ?? "",
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      image_url: initial?.image_url ?? "",
      sort_order: initial?.sort_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  });

  function onSubmit(values: StaffInput) {
    startTransition(async () => {
      const res = initial
        ? await updateStaff(initial.id, toFormData(values))
        : await createStaff(toFormData(values));
      if (res.ok) {
        toast.success(initial ? "บันทึกแล้ว" : "เพิ่มบุคลากรเรียบร้อยแล้ว");
        router.push("/admin/staff");
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-5">
      <div className="rounded-xl border bg-card p-4">
        <Label className="mb-2 block">รูปภาพ</Label>
        <Uploader
          bucket={BUCKETS.staffImages}
          kind="image"
          value={image}
          onChange={(url) => {
            setImage(url);
            setValue("image_url", url);
          }}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">ชื่อ-นามสกุล *</Label>
          <Input id="full_name" {...register("full_name")} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="position">ตำแหน่ง *</Label>
          <Input id="position" {...register("position")} />
          {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="responsibility">หน้าที่รับผิดชอบ</Label>
        <Textarea id="responsibility" rows={2} {...register("responsibility")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">เบอร์โทร</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">อีเมล</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid items-end gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sort_order">ลำดับการแสดง</Label>
          <Input id="sort_order" type="number" {...register("sort_order")} />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="is_active">แสดงบนเว็บไซต์</Label>
          <Switch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(v) => setValue("is_active", v)}
          />
        </div>
      </div>

      <Button type="submit" className="w-fit gap-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {initial ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
      </Button>
    </form>
  );
}
