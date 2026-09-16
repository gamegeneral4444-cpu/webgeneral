import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { canAccessAdmin } from "@/lib/permissions";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();

  // ยังไม่ login หรือเชื่อม Supabase ไม่ได้ → ไปหน้า login
  if (!current) redirect("/login");

  const role = current.profile?.role;
  if (!current.profile?.is_active || !canAccessAdmin(role)) {
    redirect("/login");
  }

  return (
    <AdminShell
      role={role!}
      fullName={current.profile?.full_name ?? ""}
      email={current.email}
    >
      {children}
    </AdminShell>
  );
}
