"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { updateUserRole, toggleUserActive } from "@/lib/actions/users";
import type { Profile } from "@/types/database";

export function UserRow({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();

  function onRole(role: string) {
    startTransition(async () => {
      const res = await updateUserRole(user.id, role);
      if (res.ok) toast.success("เปลี่ยนบทบาทแล้ว");
      else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function onActive(active: boolean) {
    startTransition(async () => {
      const res = await toggleUserActive(user.id, active);
      if (res.ok) toast.success(active ? "เปิดใช้งานบัญชีแล้ว" : "ระงับบัญชีแล้ว");
      else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {user.full_name || "-"}
        {isSelf && <Badge variant="outline" className="ml-2 text-xs">คุณ</Badge>}
      </TableCell>
      <TableCell className="text-muted-foreground">{user.email}</TableCell>
      <TableCell>
        <Select value={user.role} onValueChange={onRole} disabled={isSelf || pending}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch checked={user.is_active} onCheckedChange={onActive} disabled={isSelf || pending} />
          <span className="text-sm text-muted-foreground">
            {user.is_active ? "ใช้งาน" : "ระงับ"}
          </span>
          {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>
      </TableCell>
    </TableRow>
  );
}
