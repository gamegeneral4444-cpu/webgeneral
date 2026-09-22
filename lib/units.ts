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
  /** หน้าที่และความรับผิดชอบของงาน แสดงบนการ์ดและหน้าย่อย */
  description?: string;
};

const HEALTH_NUTRITION =
  "ดูแลสุขลักษณะ สุขภาพอนามัย เมนูอาหาร คุณภาพอาหาร ยาและเวชภัณฑ์ ปลูกฝังสุขนิสัย และประสานงานโรงพยาบาลกรณีเจ็บป่วยหรืออุบัติเหตุ";

/**
 * กลุ่มงานในฝ่ายบริหารทั่วไป — แหล่งข้อมูลชุดเดียวของทั้งเว็บ
 * ใช้ทั้งหน้า /units, หน้าย่อย /units/[slug] และหัวข้อ "ขอบข่ายงาน" ในหน้า /about
 *
 * slug ห้ามแก้หลังมีโพสต์แล้ว เพราะ unit_posts อ้างอิงงานด้วยค่านี้
 * ถ้าจำเป็นต้องเปลี่ยน ต้องไล่ update unit_posts.unit_slug ตามด้วย
 */
export const UNITS: Unit[] = [
  {
    slug: "building",
    label: "งานอาคารสถานที่",
    icon: Building2,
    description:
      "วางแผน ออกระเบียบดูแลและบำรุงรักษา นิเทศการใช้สถานที่ ระบบสาธารณูปโภค ซ่อมแซมอาคาร และจัดบริการสถานที่แก่บุคลากรและบุคคลภายนอก",
  },
  {
    slug: "av",
    label: "งานโสตทัศนูปกรณ์",
    icon: Projector,
    description:
      "จัดหา ดูแลบำรุงรักษา และให้บริการเครื่องมือโสตทัศนศึกษา เช่น เครื่องขยายเสียง เครื่องฉายภาพ",
  },
  {
    slug: "plan-info",
    label: "งานแผนปฏิบัติการและสารสนเทศ",
    icon: ClipboardList,
    description:
      "จัดทำแผนงาน งบประมาณ ปฏิทินปฏิบัติงาน สรุปข้อมูลสารสนเทศ นิเทศ ติดตาม และประเมินผล",
  },
  {
    slug: "supervision",
    label: "งานนิเทศ ติดตาม ประเมินผล และรายงานผล",
    icon: ClipboardCheck,
    description:
      "วางแผน จัดทำแบบฟอร์มการนิเทศ และประเมินผลการปฏิบัติงานของครูและบุคลากรเพื่อปรับปรุงประสิทธิภาพงาน",
  },
  {
    slug: "fundraising",
    label: "งานระดมทุนและทรัพยากร",
    icon: HandCoins,
    description:
      "ประสานงานระดมทุน จัดทำบัญชี จัดทำข้อมูลผู้พิการเพื่อขอทุน และประกาศเกียรติคุณผู้ทำคุณประโยชน์",
  },
  // งานโภชนาการกับงานอนามัยแยกเป็นสองงานตามผังบุคลากร แต่คำอธิบายต้นฉบับรวมไว้ด้วยกัน
  { slug: "nutrition", label: "งานโภชนาการ", icon: UtensilsCrossed, description: HEALTH_NUTRITION },
  { slug: "health", label: "งานอนามัย", icon: HeartPulse, description: HEALTH_NUTRITION },
  {
    slug: "security",
    label: "งานรักษาความปลอดภัย",
    icon: ShieldCheck,
    description:
      "จัดเวรยามดูแลความปลอดภัยและทรัพย์สินตลอด 24 ชั่วโมง ตรวจสอบระบบไฟฟ้าและสัญญาณเตือนภัย และรายงานเหตุการณ์ต่อผู้บังคับบัญชา",
  },
  {
    slug: "community",
    label: "งานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์",
    icon: Handshake,
    description:
      "สร้างความร่วมมือกับชุมชน ทั้งการประชุม ให้บริการสถานที่และอุปกรณ์ ร่วมกิจกรรมประเพณีวัฒนธรรม และจัดหาทุนสนับสนุน",
  },
  // ยังไม่มีคำอธิบายจากต้นฉบับ
  { slug: "student-support", label: "งานระบบดูแลช่วยเหลือนักเรียน", icon: HeartHandshake },
  {
    slug: "student-affairs",
    label: "งานกิจการนักเรียน",
    icon: Users,
    description:
      "ส่งเสริมความถนัด ทักษะอาชีพ ศิลปะ กีฬา การอนุรักษ์วัฒนธรรม และการเรียนรู้ตลอดชีวิตของผู้เรียน",
  },
  {
    slug: "pr",
    label: "งานประชาสัมพันธ์และเผยแพร่",
    icon: Megaphone,
    description:
      "วางแผนประชาสัมพันธ์ ผลิตสื่อและวารสาร แจ้งข้อมูลข่าวสารผ่านสื่อต่าง ๆ และจัดต้อนรับคณะศึกษาดูงาน",
  },
  {
    slug: "vehicle",
    label: "งานยานพาหนะ",
    icon: Car,
    description:
      "บริการจัดยานพาหนะ จัดทำทะเบียนควบคุม บำรุงรักษารถ และกำกับดูแลพนักงานขับรถให้ปฏิบัติงานอย่างปลอดภัย",
  },
  {
    slug: "admin-office",
    label: "งานธุรการและสารบรรณ",
    icon: FileStack,
    description:
      "จัดทำ ลงทะเบียน รับ-ส่งหนังสือราชการ ออกคำสั่ง เก็บและทำลายเอกสาร จัดประชุม และบริการงานสารบรรณ",
  },
];

export function findUnit(slug: string): Unit | undefined {
  return UNITS.find((u) => u.slug === slug);
}

/**
 * คำอธิบายที่จะแสดงจริง: ใช้ข้อความที่แอดมินแก้ในฐานข้อมูลก่อน
 * ถ้าไม่มีหรือว่าง ค่อยใช้ข้อความสำรองในโค้ด
 */
export function unitDescription(
  unit: Unit,
  overrides: Record<string, string>,
): string | undefined {
  return overrides[unit.slug]?.trim() || unit.description;
}
