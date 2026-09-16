import {
  Building2,
  Projector,
  ClipboardList,
  ClipboardCheck,
  HandCoins,
  UtensilsCrossed,
  HeartPulse,
  ShieldCheck,
  Handshake,
  HeartHandshake,
  Users,
  Megaphone,
  Car,
  FileStack,
  type LucideIcon,
} from "lucide-react";

export type Unit = {
  /** ใช้เป็น URL `/units/<slug>` และเป็นค่าในคอลัมน์ unit_posts.unit_slug */
  slug: string;
  label: string;
  icon: LucideIcon;
  /** ชื่อผู้รับผิดชอบ เว้นว่างไว้ได้ หน้าเว็บจะขึ้นว่ายังไม่ได้ระบุ */
  owner?: string;
};

/**
 * งานในฝ่ายบริหารงานทั่วไป — แหล่งข้อมูลชุดเดียวของทั้งเว็บ
 * ใช้ทั้งหน้า /units, หน้าย่อย /units/[slug] และหัวข้อ "ขอบข่ายงาน" ในหน้า /about
 *
 * slug ห้ามแก้หลังมีโพสต์แล้ว เพราะ unit_posts อ้างอิงงานด้วยค่านี้
 * ถ้าจำเป็นต้องเปลี่ยน ต้องไล่ update unit_posts.unit_slug ตามด้วย
 */
export const UNITS: Unit[] = [
  { slug: "building", label: "งานอาคารสถานที่", icon: Building2 },
  { slug: "av", label: "งานโสตทัศนูปกรณ์", icon: Projector },
  { slug: "plan-info", label: "งานแผนปฏิบัติการและสารสนเทศ", icon: ClipboardList },
  { slug: "supervision", label: "งานนิเทศ ติดตาม ประเมินผล และรายงานผล", icon: ClipboardCheck },
  { slug: "fundraising", label: "งานระดมทุนและทรัพยากร", icon: HandCoins },
  { slug: "nutrition", label: "งานโภชนาการ", icon: UtensilsCrossed },
  { slug: "health", label: "งานอนามัย", icon: HeartPulse },
  { slug: "security", label: "งานรักษาความปลอดภัย", icon: ShieldCheck },
  { slug: "community", label: "งานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์", icon: Handshake },
  { slug: "student-support", label: "งานระบบดูแลช่วยเหลือนักเรียน", icon: HeartHandshake },
  { slug: "student-affairs", label: "งานกิจการนักเรียน", icon: Users },
  { slug: "pr", label: "งานประชาสัมพันธ์และเผยแพร่", icon: Megaphone },
  { slug: "vehicle", label: "งานยานพาหนะ", icon: Car },
  { slug: "admin-office", label: "งานธุรการและสารบรรณ", icon: FileStack },
];

export function findUnit(slug: string): Unit | undefined {
  return UNITS.find((u) => u.slug === slug);
}
