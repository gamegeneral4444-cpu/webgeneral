/**
 * ค่าคงที่ส่วนกลางของเว็บไซต์
 * ใช้เป็น fallback เมื่อยังไม่ได้ตั้งค่า site_settings ในฐานข้อมูล
 */
const DEFAULT_SITE_NAME = "กลุ่มบริหารงานทั่วไป";
const envSiteName = process.env.NEXT_PUBLIC_SITE_NAME?.trim();

export const SITE = {
  // ใช้ค่าจาก env เฉพาะเมื่อมีตัวอักษรจริง — กันกรณีค่าเพี้ยนตอน deploy
  // (ภาษาไทยถูกแปลงเป็น "????" จาก console encoding) ที่จะทำให้ชื่อเว็บกลายเป็น ?????
  name: envSiteName && /\p{L}/u.test(envSiteName) ? envSiteName : DEFAULT_SITE_NAME,
  schoolName: "โรงเรียนตัวอย่างวิทยา",
  description:
    "เว็บไซต์กลุ่มบริหารงานทั่วไป รวมข่าวประชาสัมพันธ์ ระบบบริการออนไลน์ ดาวน์โหลดเอกสาร และช่องทางติดต่อของโรงเรียน",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** เมนูหลักของ Public Website */
export const PUBLIC_NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/news", label: "ข่าวประชาสัมพันธ์" },
  { href: "/services", label: "ระบบบริการ" },
  { href: "/downloads", label: "ดาวน์โหลด" },
  { href: "/gallery", label: "ภาพกิจกรรม" },
  { href: "/staff", label: "บุคลากร" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

/** สถานะข่าว */
export const NEWS_STATUS = {
  draft: "ฉบับร่าง",
  published: "เผยแพร่",
  archived: "เก็บถาวร",
} as const;

/** สถานะระบบบริการ */
export const SERVICE_STATUS = {
  active: "เปิดใช้งาน",
  maintenance: "ปรับปรุง",
  inactive: "ปิดใช้งาน",
} as const;

/** กฎการอัปโหลดไฟล์ (อ้างอิงเอกสาร 07) */
export const UPLOAD_RULES = {
  image: {
    accept: ["image/jpeg", "image/png", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
    label: "JPG, PNG, WEBP ไม่เกิน 5MB",
  },
  document: {
    accept: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    maxSize: 20 * 1024 * 1024, // 20MB
    label: "PDF, DOC, DOCX, XLS, XLSX ไม่เกิน 20MB",
  },
} as const;

/** ชื่อ Storage Buckets (อ้างอิงเอกสาร 06/11) */
export const BUCKETS = {
  newsCovers: "news-covers",
  documentFiles: "document-files",
  galleryImages: "gallery-images",
  staffImages: "staff-images",
  siteAssets: "site-assets",
} as const;
