import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/categories";
import { CATEGORY_CONFIG, type CategoryTable } from "@/lib/actions/category-config";
import { adminListCategoriesWithCount } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "จัดการหมวดหมู่" };

async function createCategoryForm(table: CategoryTable, formData: FormData) {
  "use server";
  await createCategory(table, formData);
}

async function updateCategoryForm(table: CategoryTable, id: string, formData: FormData) {
  "use server";
  await updateCategory(table, id, formData);
}

function CategoryFields({ initial }: { initial?: { name: string; slug: string; description: string | null; sort_order: number; is_active: boolean } }) {
  return (
    <>
      <Input name="name" defaultValue={initial?.name} placeholder="ชื่อหมวดหมู่" aria-label="ชื่อหมวดหมู่" required />
      <Input name="slug" defaultValue={initial?.slug} placeholder="slug" aria-label="slug" required />
      <Input name="description" defaultValue={initial?.description ?? ""} placeholder="คำอธิบาย (ถ้ามี)" aria-label="คำอธิบาย" />
      <Input name="sort_order" type="number" min="0" defaultValue={initial?.sort_order ?? 0} aria-label="ลำดับ" />
      <label className="flex min-h-10 items-center gap-2 text-sm text-slate-600"><input name="is_active" type="checkbox" defaultChecked={initial?.is_active ?? true} className="size-4 accent-[var(--admin-gold)]" /> เปิดใช้งาน</label>
    </>
  );
}

async function CategoryGroup({ table }: { table: CategoryTable }) {
  const rows = await adminListCategoriesWithCount(table);
  return (
    <div className="space-y-4">
      <form action={createCategoryForm.bind(null, table)} className="grid gap-3 rounded-xl border border-[var(--admin-border)] bg-amber-50/40 p-4 md:grid-cols-[1fr_1fr_1.5fr_7rem_auto_auto] md:items-end">
        <CategoryFields />
        <Button type="submit" className="bg-[var(--admin-gold)] text-[var(--admin-navy-strong)] hover:bg-[var(--admin-gold-bright)]">เพิ่มหมวดหมู่</Button>
      </form>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-[var(--admin-border)] bg-white p-4 shadow-sm">
            <form action={updateCategoryForm.bind(null, table, row.id)} className="grid gap-3 md:grid-cols-[1fr_1fr_1.5fr_7rem_auto_auto_auto] md:items-end">
              <CategoryFields initial={row} />
              <p className="text-xs text-muted-foreground">ใช้งาน {row.usage_count} รายการ</p>
              <Button type="submit" variant="outline">บันทึก</Button>
            </form>
            <div className="mt-2 flex justify-end">
              <DeleteButton action={deleteCategory.bind(null, table, row.id)} itemName={row.name} disabled={row.usage_count > 0} />
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="rounded-xl border border-dashed bg-white py-10 text-center text-sm text-muted-foreground">ยังไม่มีหมวดหมู่</p>}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const tables = Object.keys(CATEGORY_CONFIG) as CategoryTable[];
  return (
    <div>
      <AdminPageHeader title="จัดการหมวดหมู่" description="หมวดข่าว เอกสาร และระบบบริการที่เชื่อมกับเว็บไซต์จริง" />
      <Tabs defaultValue="news_categories">
        <TabsList className="mb-4 h-auto flex-wrap bg-white p-1 shadow-sm">
          {tables.map((table) => <TabsTrigger key={table} value={table}>หมวด{CATEGORY_CONFIG[table].label}</TabsTrigger>)}
        </TabsList>
        {tables.map((table) => <TabsContent key={table} value={table}><CategoryGroup table={table} /></TabsContent>)}
      </Tabs>
    </div>
  );
}
