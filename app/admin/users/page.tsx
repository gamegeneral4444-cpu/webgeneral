import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UserRow } from "./user-row";
import { adminListProfiles } from "@/lib/admin-data";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageUsers } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการผู้ใช้งาน" };

export default async function AdminUsersPage() {
  const current = await getCurrentUser();
  if (!canManageUsers(current?.profile?.role)) redirect("/admin");

  const users = await adminListProfiles();

  return (
    <div>
      <AdminPageHeader
        title="จัดการผู้ใช้งาน"
        description="กำหนดบทบาทและสถานะของผู้ดูแลระบบ (เฉพาะ Super Admin)"
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>สถานะบัญชี</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} isSelf={u.id === current?.userId} />
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        หมายเหตุ: การเพิ่มผู้ใช้ใหม่ทำผ่าน Supabase Dashboard → Authentication → Add user
        ระบบจะสร้างโปรไฟล์อัตโนมัติ จากนั้นกำหนดบทบาทที่หน้านี้
      </p>
    </div>
  );
}
