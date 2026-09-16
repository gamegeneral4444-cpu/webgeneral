import { UnitPostForm } from "../unit-post-form";

export const metadata = { title: "เพิ่มรายการงาน" };

export default function CreateUnitPostPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[var(--admin-ink)]">เพิ่มรายการงาน</h1>
      <UnitPostForm />
    </div>
  );
}
