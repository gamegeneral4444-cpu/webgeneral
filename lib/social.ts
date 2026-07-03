/**
 * ตัวช่วยลิงก์โซเชียล
 * คืน URL เฉพาะเมื่อเป็น http/https เท่านั้น เพื่อใช้เป็น href ได้อย่างปลอดภัย
 * (กัน javascript:/data: ที่อาจถูกใส่มาในช่อง LINE แบบยืดหยุ่น)
 * ถ้าไม่ใช่ URL ที่ปลอดภัย (เช่น LINE ID "@xxx" หรือค่าว่าง) จะคืน null
 */
export function safeHttpUrl(value?: string | null): string | null {
  const v = (value ?? "").trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:" ? v : null;
  } catch {
    return null;
  }
}
