import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-gold/40">
              <GraduationCap className="size-7" aria-hidden />
            </span>
            <span className="text-xl font-bold text-white">กลุ่มบริหารงานทั่วไป</span>
          </Link>
          <p className="mt-1 text-sm text-slate-400">ระบบจัดการหลังบ้าน (Admin)</p>
        </div>

        <div className="rounded-2xl border bg-card p-7 shadow-xl">
          <h1 className="text-lg font-bold text-foreground">เข้าสู่ระบบ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            กรอกอีเมลและรหัสผ่านของผู้ดูแลระบบ
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm text-slate-400 hover:text-gold"
        >
          <ArrowLeft className="size-4" aria-hidden /> กลับสู่หน้าเว็บไซต์
        </Link>
      </div>
    </div>
  );
}
