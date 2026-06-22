import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ServiceForm } from "../../service-form";
import { adminGetService } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "แก้ไขบริการ" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await adminGetService(id);
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title="แก้ไขบริการ" description={service.name} />
      <ServiceForm initial={service} />
    </div>
  );
}
