import { AdminPageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "../service-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "เพิ่มบริการ" };

export default function CreateServicePage() {
  return (
    <div>
      <AdminPageHeader title="เพิ่มบริการ" description="กรอกข้อมูลระบบบริการออนไลน์" />
      <ServiceForm />
    </div>
  );
}
