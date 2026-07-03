import { describe, it, expect } from "vitest";
import { extractMapEmbedSrc, isValidMapEmbedUrl } from "@/lib/map-embed";

describe("extractMapEmbedSrc", () => {
  it("ดึง src จากโค้ด <iframe> ทั้งก้อน", () => {
    const html = `<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450"></iframe>`;
    expect(extractMapEmbedSrc(html)).toBe("https://www.google.com/maps/embed?pb=!1m18");
  });

  it("คืนค่า URL เดิม (trim) ถ้าไม่ใช่ iframe", () => {
    expect(extractMapEmbedSrc("  https://www.google.com/maps/embed?pb=1  ")).toBe(
      "https://www.google.com/maps/embed?pb=1",
    );
  });

  it("คืนค่าว่างเมื่อ input ว่าง", () => {
    expect(extractMapEmbedSrc("")).toBe("");
    expect(extractMapEmbedSrc("   ")).toBe("");
  });
});

describe("isValidMapEmbedUrl", () => {
  it("ยอมรับ embed URL มาตรฐาน", () => {
    expect(isValidMapEmbedUrl("https://www.google.com/maps/embed?pb=!1m18")).toBe(true);
  });

  it("ยอมรับ My Maps (/maps/d/embed) และโหมดเก่า output=embed", () => {
    expect(isValidMapEmbedUrl("https://www.google.com/maps/d/embed?mid=abc")).toBe(true);
    expect(isValidMapEmbedUrl("https://maps.google.com/maps?q=x&output=embed")).toBe(true);
  });

  it("ปฏิเสธลิงก์แชร์ maps.app.goo.gl", () => {
    expect(isValidMapEmbedUrl("https://maps.app.goo.gl/nyPTthngzyVtBGEy7")).toBe(false);
  });

  it("ปฏิเสธ http, โดเมนปลอม และ javascript: (กัน XSS)", () => {
    expect(isValidMapEmbedUrl("http://www.google.com/maps/embed?pb=1")).toBe(false);
    expect(isValidMapEmbedUrl("https://www.google.com.evil.com/maps/embed?pb=1")).toBe(false);
    expect(isValidMapEmbedUrl("https://evilgoogle.com/maps/embed?pb=1")).toBe(false);
    expect(isValidMapEmbedUrl("javascript:alert(1)")).toBe(false);
  });

  it("ปฏิเสธหน้า Google Maps ปกติที่ฝังไม่ได้", () => {
    expect(isValidMapEmbedUrl("https://www.google.com/maps/place/Bangkok")).toBe(false);
  });
});
