import { AdminPageHeader } from "@/components/admin/page-header";
import { StaffForm } from "../staff-form";
import { getUnits } from "@/lib/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "เพิ่มบุคลากร" };

export default async function CreateStaffPage() {
  const units = await getUnits({ includeHidden: true });
  return (
    <div>
      <AdminPageHeader title="เพิ่มบุคลากร" description="กรอกข้อมูลบุคลากร" />
      <StaffForm units={units} />
    </div>
  );
}
