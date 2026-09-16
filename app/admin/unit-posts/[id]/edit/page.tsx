import { notFound } from "next/navigation";
import { getUnitPost } from "@/lib/data";
import { UnitPostForm } from "../../unit-post-form";

export const metadata = { title: "แก้ไขรายการงาน" };

export default async function EditUnitPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getUnitPost(id);
  if (!post) notFound();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[var(--admin-ink)]">แก้ไขรายการงาน</h1>
      <UnitPostForm initial={post} />
    </div>
  );
}
