import { AdminPageHeader } from "@/components/admin/page-header";
import { DocumentForm } from "../document-form";
import { adminListCategories } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "เพิ่มเอกสาร" };

export default async function CreateDocumentPage() {
  const categories = await adminListCategories("document_categories");
  return (
    <div>
      <AdminPageHeader title="เพิ่มเอกสาร" description="อัปโหลดไฟล์และกรอกรายละเอียด" />
      <DocumentForm categories={categories} />
    </div>
  );
}
