export type Unit = {
  /** ใช้เป็น URL `/units/<slug>` และเป็นค่าในคอลัมน์ unit_posts.unit_slug และ unit_staff.unit_slug */
  slug: string;
  label: string;
  /** ชื่อไอคอน Lucide เก็บเป็นข้อความ เช่น "Building2" แสดงผ่าน <LucideIcon name={...} /> */
  icon: string;
  /** หน้าที่และความรับผิดชอบ แสดงบนการ์ดและหน้าย่อย */
  description?: string;
};

const HEALTH_NUTRITION =
  "ดูแลสุขลักษณะ สุขภาพอนามัย เมนูอาหาร คุณภาพอาหาร ยาและเวชภัณฑ์ ปลูกฝังสุขนิสัย และประสานงานโรงพยาบาลกรณีเจ็บป่วยหรืออุบัติเหตุ";

/**
 * รายชื่อกลุ่มงานสำรอง — ใช้เมื่อยังไม่ได้สร้างตาราง `units` หรือต่อฐานข้อมูลไม่ได้
 *
 * แหล่งข้อมูลจริงคือตาราง `units` ในฐานข้อมูล แก้ได้ที่ /admin/units
 * ไฟล์นี้มีไว้เพื่อให้เว็บยังแสดงงานครบ 14 งานได้แม้ฐานข้อมูลล่ม
 */
export const FALLBACK_UNITS: Unit[] = [
  {
    slug: "building",
    label: "งานอาคารสถานที่",
    icon: "Building2",
    description:
      "วางแผน ออกระเบียบดูแลและบำรุงรักษา นิเทศการใช้สถานที่ ระบบสาธารณูปโภค ซ่อมแซมอาคาร และจัดบริการสถานที่แก่บุคลากรและบุคคลภายนอก",
  },
  {
    slug: "av",
    label: "งานโสตทัศนูปกรณ์",
    icon: "Projector",
    description:
      "จัดหา ดูแลบำรุงรักษา และให้บริการเครื่องมือโสตทัศนศึกษา เช่น เครื่องขยายเสียง เครื่องฉายภาพ",
  },
  {
    slug: "plan-info",
    label: "งานแผนปฏิบัติการและสารสนเทศ",
    icon: "ClipboardList",
    description:
      "จัดทำแผนงาน งบประมาณ ปฏิทินปฏิบัติงาน สรุปข้อมูลสารสนเทศ นิเทศ ติดตาม และประเมินผล",
  },
  {
    slug: "supervision",
    label: "งานนิเทศ ติดตาม ประเมินผล และรายงานผล",
    icon: "ClipboardCheck",
    description:
      "วางแผน จัดทำแบบฟอร์มการนิเทศ และประเมินผลการปฏิบัติงานของครูและบุคลากรเพื่อปรับปรุงประสิทธิภาพงาน",
  },
  {
    slug: "fundraising",
    label: "งานระดมทุนและทรัพยากร",
    icon: "HandCoins",
    description:
      "ประสานงานระดมทุน จัดทำบัญชี จัดทำข้อมูลผู้พิการเพื่อขอทุน และประกาศเกียรติคุณผู้ทำคุณประโยชน์",
  },
  { slug: "nutrition", label: "งานโภชนาการ", icon: "UtensilsCrossed", description: HEALTH_NUTRITION },
  { slug: "health", label: "งานอนามัย", icon: "HeartPulse", description: HEALTH_NUTRITION },
  {
    slug: "security",
    label: "งานรักษาความปลอดภัย",
    icon: "ShieldCheck",
    description:
      "จัดเวรยามดูแลความปลอดภัยและทรัพย์สินตลอด 24 ชั่วโมง ตรวจสอบระบบไฟฟ้าและสัญญาณเตือนภัย และรายงานเหตุการณ์ต่อผู้บังคับบัญชา",
  },
  {
    slug: "community",
    label: "งานสัมพันธ์ชุมชน เครือข่ายและวิเทศสัมพันธ์",
    icon: "Handshake",
    description:
      "สร้างความร่วมมือกับชุมชน ทั้งการประชุม ให้บริการสถานที่และอุปกรณ์ ร่วมกิจกรรมประเพณีวัฒนธรรม และจัดหาทุนสนับสนุน",
  },
  { slug: "student-support", label: "งานระบบดูแลช่วยเหลือนักเรียน", icon: "HeartHandshake" },
  {
    slug: "student-affairs",
    label: "งานกิจการนักเรียน",
    icon: "Users",
    description:
      "ส่งเสริมความถนัด ทักษะอาชีพ ศิลปะ กีฬา การอนุรักษ์วัฒนธรรม และการเรียนรู้ตลอดชีวิตของผู้เรียน",
  },
  {
    slug: "pr",
    label: "งานประชาสัมพันธ์และเผยแพร่",
    icon: "Megaphone",
    description:
      "วางแผนประชาสัมพันธ์ ผลิตสื่อและวารสาร แจ้งข้อมูลข่าวสารผ่านสื่อต่าง ๆ และจัดต้อนรับคณะศึกษาดูงาน",
  },
  {
    slug: "vehicle",
    label: "งานยานพาหนะ",
    icon: "Car",
    description:
      "บริการจัดยานพาหนะ จัดทำทะเบียนควบคุม บำรุงรักษารถ และกำกับดูแลพนักงานขับรถให้ปฏิบัติงานอย่างปลอดภัย",
  },
  {
    slug: "admin-office",
    label: "งานธุรการและสารบรรณ",
    icon: "FileStack",
    description:
      "จัดทำ ลงทะเบียน รับ-ส่งหนังสือราชการ ออกคำสั่ง เก็บและทำลายเอกสาร จัดประชุม และบริการงานสารบรรณ",
  },
];

export function findUnitIn(units: Unit[], slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}

/** รหัสงานต้องเป็น a-z 0-9 และขีดกลางเท่านั้น เพราะใช้เป็น URL */
export function isValidUnitSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}
