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
  /** ชื่องานตามโครงสร้างของฝ่าย */
  label: string;
  icon: LucideIcon;
  /** ชื่อผู้รับผิดชอบ เว้นว่างไว้ได้ หน้าเว็บจะแสดงว่ายังไม่ได้ระบุ */
  owner?: string;
};

/**
 * งานในฝ่ายบริหารงานทั่วไป — แหล่งข้อมูลชุดเดียวของทั้งเว็บ
 * ใช้ทั้งหน้า /units และหัวข้อ "ขอบข่ายงาน" ในหน้า /about
 * แก้ที่นี่ที่เดียวแล้วเปลี่ยนทั้งสองหน้า
 */
export const UNITS: Unit[] = [
  { label: "งานอาคารสถานที่", icon: Building2 },
  { label: "งานโสตทัศนูปกรณ์", icon: Projector },
  { label: "งานแผนปฏิบัติการและสารสนเทศ", icon: ClipboardList },
  { label: "งานนิเทศ ติดตาม ประเมินผล และรายงานผล", icon: ClipboardCheck },
  { label: "งานระดมทุนและทรัพยากร", icon: HandCoins },
  { label: "งานโภชนาการ", icon: UtensilsCrossed },
  { label: "งานอนามัย", icon: HeartPulse },
  { label: "งานรักษาความปลอดภัย", icon: ShieldCheck },
  { label: "งานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์", icon: Handshake },
  { label: "งานระบบดูแลช่วยเหลือนักเรียน", icon: HeartHandshake },
  { label: "งานกิจการนักเรียน", icon: Users },
  { label: "งานประชาสัมพันธ์และเผยแพร่", icon: Megaphone },
  { label: "งานยานพาหนะ", icon: Car },
  { label: "งานธุรการและสารบรรณ", icon: FileStack },
];
