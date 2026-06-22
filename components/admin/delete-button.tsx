"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionResult } from "@/lib/actions/helpers";

/**
 * ปุ่มลบพร้อม Confirm Dialog — รับ server action ที่ bind id ไว้แล้ว
 */
export function DeleteButton({
  action,
  itemName,
  label = "ลบ",
  iconOnly,
}: {
  action: () => Promise<ActionResult>;
  itemName: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await action();
      if (res.ok) toast.success("ลบข้อมูลเรียบร้อยแล้ว");
      else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size={iconOnly ? "icon" : "sm"}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={pending}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          {!iconOnly && label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
          <AlertDialogDescription>
            ต้องการลบ &quot;{itemName}&quot; ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            ลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
