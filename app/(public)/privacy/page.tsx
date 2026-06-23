import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "นโยบายความเป็นส่วนตัว" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-slate-900">นโยบายความเป็นส่วนตัว</h1>
      <div className="mt-6 space-y-5 leading-7 text-slate-600">
        <p>เว็บไซต์เก็บสถิติการเข้าชมแบบรวมรายวันเพื่อปรับปรุงเนื้อหาและคุณภาพการให้บริการ โดยตารางสถิติภายในบันทึกเฉพาะวันที่ เส้นทางหน้าเว็บ และจำนวนครั้งที่เข้าชม</p>
        <p>ระบบสถิติภายในไม่จัดเก็บหมายเลข IP แบบดิบ ตัวระบุจากคุกกี้ visitor ID หรือ user-agent แบบเต็ม และไม่ใช้ข้อมูลดังกล่าวเพื่อสร้างโปรไฟล์รายบุคคล</p>
        <p>บริการ Vercel Web Analytics ทำงานตามการตั้งค่าของโครงการ Vercel หากต้องการสอบถามเกี่ยวกับข้อมูลส่วนบุคคลหรือขอใช้สิทธิ โปรดติดต่อหน่วยงานผ่านหน้า <Link href="/contact" className="font-medium text-primary hover:underline">ติดต่อเรา</Link></p>
      </div>
    </article>
  );
}
