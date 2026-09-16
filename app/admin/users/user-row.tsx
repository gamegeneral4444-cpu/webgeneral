"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type Role } from "@/lib/permissions";
import { updateUserRole, toggleUserActive, updateUserName } from "@/lib/actions/users";
import type { Profile } from "@/types/database";

export function UserRow({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.full_name ?? "");

  function onRole(role: string) {
    startTransition(async () => {
      const res = await updateUserRole(user.id, role);
      if (res.ok) toast.success("เปลี่ยนบทบาทแล้ว");
      else toast.error(res.error ?? "เกิดข้อผิดพลาด");
    });
  }

  function onSaveName() {
    startTransition(async () => {
      const res = await updateUserName(user.id, name);
      if (res.ok) {
        toast.success("เปลี่ยนชื่อแล้ว");
        setEditing(false);
      } else {
        toast.error(res.error ?? "เกิดข้อผิดพลาด");
      }
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
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveName();
                if (e.key === "Escape") {
                  setName(user.full_name ?? "");
                  setEditing(false);
                }
              }}
              maxLength={255}
              autoFocus
              aria-label="ชื่อผู้ใช้"
              className="h-9 w-48"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={onSaveName}
              disabled={pending}
              aria-label="บันทึกชื่อ"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setName(user.full_name ?? "");
                setEditing(false);
              }}
              aria-label="ยกเลิก"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <span>{user.full_name || "-"}</span>
            {isSelf && <Badge variant="outline" className="ml-1 text-xs">คุณ</Badge>}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setEditing(true)}
              aria-label={`แก้ชื่อของ ${user.full_name || user.email}`}
              className="size-8 text-muted-foreground"
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        )}
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
