/**
 * จัดรูปแบบวันที่เป็นภาษาไทย (พ.ศ.)
 */
export function formatThaiDate(
  value?: string | Date | null,
  opts: { withTime?: boolean } = {},
): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (isNaN(date.getTime())) return "-";

  const formatter = new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(opts.withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    calendar: "buddhist",
  });
  return formatter.format(date);
}

/**
 * จัดรูปแบบขนาดไฟล์
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * จัดรูปแบบตัวเลขแบบมี comma
 */
export function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("th-TH").format(value ?? 0);
}

/**
 * ชนิดไฟล์จากนามสกุล/MIME สำหรับแสดง badge
 */
export function fileExtLabel(fileName?: string | null, fileType?: string | null): string {
  if (fileName?.includes(".")) {
    return fileName.split(".").pop()!.toUpperCase();
  }
  if (fileType) {
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("word")) return "DOC";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "XLS";
  }
  return "FILE";
}
