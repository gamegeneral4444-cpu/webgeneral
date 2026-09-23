import { UnitPostForm } from "../unit-post-form";
import { getUnits } from "@/lib/data";

export const metadata = { title: "เพิ่มรายการงาน" };

export default async function CreateUnitPostPage() {
  const units = await getUnits({ includeHidden: true });
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[var(--admin-ink)]">เพิ่มรายการงาน</h1>
      <UnitPostForm units={units} />
    </div>
  );
}
