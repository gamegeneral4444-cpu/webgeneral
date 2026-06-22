import { AdminPageHeader } from "@/components/admin/page-header";
import { NewsForm } from "../news-form";
import { adminListCategories } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "เพิ่มข่าว" };

export default async function CreateNewsPage() {
  const categories = await adminListCategories("news_categories");
  return (
    <div>
      <AdminPageHeader title="เพิ่มข่าว" description="กรอกข้อมูลข่าวประชาสัมพันธ์" />
      <NewsForm categories={categories} />
    </div>
  );
}
