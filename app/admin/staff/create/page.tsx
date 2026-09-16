import { AdminPageHeader } from "@/components/admin/page-header";
import { StaffForm } from "../staff-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "เพิ่มบุคลากร" };

export default function CreateStaffPage() {
  return (
    <div>
      <AdminPageHeader title="เพิ่มบุคลากร" description="กรอกข้อมูลบุคลากร" />
      <StaffForm />
    </div>
  );
}
