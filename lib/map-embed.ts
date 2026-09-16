/**
 * ตัวช่วยจัดการ Google Map Embed URL
 * - รองรับการวางโค้ด <iframe> ทั้งก้อน (ดึงเฉพาะ src ออกมา)
 * - ตรวจว่าเป็น embed URL ของ Google Maps จริง (กัน share link ที่ฝังไม่ได้ + กัน XSS)
 */

/** ดึงค่า src จากโค้ด <iframe> ถ้าวางมาทั้งก้อน; ถ้าไม่ใช่ก็คืนค่าที่ trim แล้ว */
export function extractMapEmbedSrc(input: string): string {
  const value = (input ?? "").trim();
  if (!value) return "";
  const match = value.match(/<iframe[^>]*\bsrc=["']([^"']+)["']/i);
  return (match ? match[1] : value).trim();
}

/** เป็น Google Maps embed URL ที่ฝังใน iframe ได้จริงไหม (ต้อง https + โดเมน google.com) */
export function isValidMapEmbedUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  const isGoogle = host === "google.com" || host.endsWith(".google.com");
  if (!isGoogle) return false;

  const path = parsed.pathname.toLowerCase();
  // โหมดฝังมาตรฐาน: /maps/embed และ My Maps /maps/d/embed
  if (/\/maps\/(d\/)?embed/.test(path)) return true;
  // โหมดเก่า: /maps?...&output=embed
  if (path.startsWith("/maps") && parsed.searchParams.get("output") === "embed") return true;
  return false;
}
