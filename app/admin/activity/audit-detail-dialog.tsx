"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AuditDetailDialog({ before, after }: { before: unknown; after: unknown }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline" size="icon-sm" aria-label="ดูรายละเอียดการเปลี่ยนแปลง"><Eye className="size-4" /></Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>รายละเอียดก่อนและหลังแก้ไข</DialogTitle></DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <section><h3 className="mb-2 text-sm font-semibold">ก่อนเปลี่ยนแปลง</h3><pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs whitespace-pre-wrap text-slate-100">{JSON.stringify(before, null, 2) || "-"}</pre></section>
          <section><h3 className="mb-2 text-sm font-semibold">หลังเปลี่ยนแปลง</h3><pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs whitespace-pre-wrap text-slate-100">{JSON.stringify(after, null, 2) || "-"}</pre></section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
