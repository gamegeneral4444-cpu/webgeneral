import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { getUnitRows, getUnitUsage } from "@/lib/data";
import { getCurrentUser } from "@/lib/supabase/server";
import { canManageSite } from "@/lib/permissions";
import { UnitEditor } from "./unit-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการกลุ่มงาน" };

export default async function AdminUnitsPage() {
  const current = await getCurrentUser();
  if (!canManageSite(current?.profile?.role)) redirect("/admin");

  const [rows, usage] = await Promise.all([getUnitRows(), getUnitUsage()]);

  return (
    <div>
      <AdminPageHeader
        title="จัดการกลุ่มงาน"
        description="เพิ่ม แก้ไข เรียงลำดับ และซ่อนกลุ่มงาน — ข้อมูลนี้ใช้ทั้งเมนูบนหัวเว็บ หน้ากลุ่มงาน และหน้าเกี่ยวกับเรา"
      />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 p-8 text-center">
          <p className="font-medium text-foreground">ยังไม่ได้สร้างตารางกลุ่มงาน</p>
          <p className="mt-1 text-sm text-muted-foreground">
            ตอนนี้เว็บกำลังใช้รายชื่อสำรองในโค้ด 14 งาน ให้รันไฟล์{" "}
            <code className="rounded bg-muted px-1.5 py-0.5">
              supabase/migrations/0014_units.sql
            </code>{" "}
            ใน Supabase SQL Editor ก่อน แล้วรีเฟรชหน้านี้
          </p>
        </div>
      ) : (
        <UnitEditor rows={rows} usage={usage} />
      )}
    </div>
  );
}
