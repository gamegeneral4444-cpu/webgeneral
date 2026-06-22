import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StaffForm } from "../../staff-form";
import { adminGetStaff } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "แก้ไขบุคลากร" };

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await adminGetStaff(id);
  if (!staff) notFound();

  return (
    <div>
      <AdminPageHeader title="แก้ไขบุคลากร" description={staff.full_name} />
      <StaffForm initial={staff} />
    </div>
  );
}
