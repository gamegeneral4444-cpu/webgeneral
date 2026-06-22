import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "./settings-form";
import { adminGetSettings } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "ตั้งค่าเว็บไซต์" };

export default async function AdminSettingsPage() {
  const settings = await adminGetSettings();
  return (
    <div>
      <AdminPageHeader title="ตั้งค่าเว็บไซต์" description="ข้อมูลทั่วไปและช่องทางติดต่อ" />
      <SettingsForm initial={settings} />
    </div>
  );
}
