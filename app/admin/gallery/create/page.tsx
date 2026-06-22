import { AdminPageHeader } from "@/components/admin/page-header";
import { AlbumForm } from "../album-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "สร้างอัลบั้ม" };

export default function CreateAlbumPage() {
  return (
    <div>
      <AdminPageHeader title="สร้างอัลบั้ม" description="สร้างอัลบั้มก่อน แล้วจึงเพิ่มรูปภาพ" />
      <AlbumForm />
    </div>
  );
}
