import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-gradient-to-br from-brand-navy via-navy-deep to-brand-navy px-4 py-10">
      <div
        className="pointer-events-none absolute -right-32 -top-32 size-[28rem] rounded-full bg-gold/20 blur-3xl"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <span className="glass-mirror-soft glass-edge-gold grid size-16 place-items-center rounded-2xl">
              <Image src="/logo.png" alt="" width={52} height={52} className="object-contain" priority />
            </span>
            <span className="text-xl font-bold text-white">ฝ่ายบริหารทั่วไป</span>
          </Link>
          <p className="mt-1 text-sm text-gold-light">ระบบจัดการหลังบ้าน (Admin)</p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-card p-7 shadow-2xl shadow-black/40">
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
          className="mt-6 inline-flex w-full items-center justify-center gap-2 text-sm text-white/70 hover:text-gold-light"
        >
          <ArrowLeft className="size-4" aria-hidden /> กลับสู่หน้าเว็บไซต์
        </Link>
      </div>
    </div>
  );
}
