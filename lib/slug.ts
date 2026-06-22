import slugify from "slugify";

/**
 * สร้าง slug จากข้อความ รองรับภาษาไทย (คงตัวอักษรไทยไว้)
 */
export function makeSlug(text: string): string {
  const base = slugify(text, { lower: true, strict: false, trim: true })
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Date.now()}`;
}
