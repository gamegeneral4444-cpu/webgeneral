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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideIcon } from "@/components/lucide-icon";
import { serviceSchema, type ServiceInput } from "@/lib/validations";
import { SERVICE_STATUS } from "@/lib/constants";
import { createService, updateService } from "@/lib/actions/services";
import type { Service } from "@/types/database";

type FormValues = z.input<typeof serviceSchema>;

function toFormData(v: FormValues): FormData {
  const fd = new FormData();
  Object.entries(v).forEach(([k, val]) => fd.append(k, val == null ? "" : String(val)));
  return fd;
}

export function ServiceForm({ initial }: { initial?: Service }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues, unknown, ServiceInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      icon: initial?.icon ?? "",
      url: initial?.url ?? "",
      status: initial?.status ?? "active",
      sort_order: initial?.sort_order ?? 0,
      is_external: initial?.is_external ?? true,
    },
  });

  const iconName = watch("icon");

  function onSubmit(values: ServiceInput) {
    startTransition(async () => {
      const res = initial
        ? await updateService(initial.id, toFormData(values))
        : await createService(toFormData(values));
      if (res.ok) {
        toast.success(initial ? "บันทึกแล้ว" : "เพิ่มบริการเรียบร้อยแล้ว");
        router.push("/admin/services");
        router.refresh();
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xl gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">ชื่อบริการ *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">คำอธิบาย</Label>
        <Textarea id="description" rows={2} {...register("description")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="icon">ไอคอน (Lucide)</Label>
          <div className="flex items-center gap-2">
            <Input id="icon" {...register("icon")} placeholder="เช่น Building2, Car" />
            <span className="grid size-10 shrink-0 place-items-center rounded-md border bg-soft-gold text-primary">
              <LucideIcon name={iconName} className="size-5" />
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            ดูชื่อไอคอนได้ที่ lucide.dev/icons
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sort_order">ลำดับการแสดง</Label>
          <Input id="sort_order" type="number" {...register("sort_order")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">ลิงก์บริการ (URL) *</Label>
        <Input id="url" {...register("url")} placeholder="https://... หรือ /downloads" />
        {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>สถานะ *</Label>
          <Select value={watch("status")} onValueChange={(v) => setValue("status", v as ServiceInput["status"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SERVICE_STATUS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label htmlFor="is_external">เปิดลิงก์แท็บใหม่</Label>
          <Switch
            id="is_external"
            checked={watch("is_external")}
            onCheckedChange={(v) => setValue("is_external", v)}
          />
        </div>
      </div>

      <Button type="submit" className="w-fit gap-2" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {initial ? "บันทึกการแก้ไข" : "เพิ่มบริการ"}
      </Button>
    </form>
  );
}
