import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { NewsForm } from "../../news-form";
import { adminGetNews, adminListCategories } from "@/lib/admin-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "แก้ไขข่าว" };

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [news, categories] = await Promise.all([
    adminGetNews(id),
    adminListCategories("news_categories"),
  ]);
  if (!news) notFound();

  return (
    <div>
      <AdminPageHeader title="แก้ไขข่าว" description={news.title} />
      <NewsForm categories={categories} initial={news} />
    </div>
  );
}
