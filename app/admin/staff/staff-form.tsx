"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
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
import { decorateStaffImageUrl, getStaffImageCrop, stripStaffImageCrop } from "@/lib/staff-image";
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
  const initialCrop = getStaffImageCrop(initial);
  const [image, setImage] = useState(stripStaffImageCrop(initial?.image_url));

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
      image_position_x: initialCrop.x,
      image_position_y: initialCrop.y,
      image_zoom: initialCrop.zoom,
      sort_order: initial?.sort_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  });

  const imagePositionX = Number(watch("image_position_x") ?? 50);
  const imagePositionY = Number(watch("image_position_y") ?? 50);
  const imageZoom = Number(watch("image_zoom") ?? 1);

  function onSubmit(values: StaffInput) {
    startTransition(async () => {
      const imageUrl = decorateStaffImageUrl(image || values.image_url || "", {
        x: Number(values.image_position_x ?? 50),
        y: Number(values.image_position_y ?? 50),
        zoom: Number(values.image_zoom ?? 1),
      });
      const payload = { ...values, image_url: imageUrl };
      const res = initial
        ? await updateStaff(initial.id, toFormData(payload))
        : await createStaff(toFormData(payload));
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
            const src = stripStaffImageCrop(url);
            setImage(src);
            setValue("image_url", src, { shouldDirty: true, shouldValidate: true });
          }}
        />
        <input type="hidden" {...register("image_url")} />
        {image && (
          <div className="mt-4 grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-[160px_1fr]">
            <div className="grid justify-center gap-2 text-center text-xs text-muted-foreground">
              <div className="relative size-36 overflow-hidden rounded-full bg-background ring-2 ring-soft-gold">
                <Image
                  src={image}
                  alt="ตัวอย่างตำแหน่งรูป"
                  fill
                  sizes="144px"
                  className="object-cover"
                  style={{
                    objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                    transform: `scale(${imageZoom})`,
                    transformOrigin: `${imagePositionX}% ${imagePositionY}%`,
                  }}
                />
              </div>
              ตัวอย่างรูปบนหน้าเว็บ
            </div>
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="image_position_x">ขยับซ้าย-ขวา</Label>
                <Input id="image_position_x" type="range" min="0" max="100" step="1" {...register("image_position_x")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image_position_y">ขยับขึ้น-ลง</Label>
                <Input id="image_position_y" type="range" min="0" max="100" step="1" {...register("image_position_y")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="image_zoom">ซูมใบหน้า</Label>
                <Input id="image_zoom" type="range" min="1" max="2" step="0.05" {...register("image_zoom")} />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-fit"
                onClick={() => {
                  setValue("image_position_x", 50, { shouldDirty: true, shouldValidate: true });
                  setValue("image_position_y", 50, { shouldDirty: true, shouldValidate: true });
                  setValue("image_zoom", 1, { shouldDirty: true, shouldValidate: true });
                }}
              >
                รีเซ็ตตำแหน่ง
              </Button>
            </div>
          </div>
        )}
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
