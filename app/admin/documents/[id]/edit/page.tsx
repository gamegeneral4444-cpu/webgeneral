import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DocumentForm } from "../../document-form";
import { adminGetDocument, adminListCategories } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "แก้ไขเอกสาร" };

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [doc, categories] = await Promise.all([
    adminGetDocument(id),
    adminListCategories("document_categories"),
  ]);
  if (!doc) notFound();

  return (
    <div>
      <AdminPageHeader title="แก้ไขเอกสาร" description={doc.title} />
      <DocumentForm categories={categories} initial={doc} />
    </div>
  );
}
