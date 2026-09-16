import { describe, it, expect } from "vitest";
import { safeHttpUrl } from "@/lib/social";

describe("safeHttpUrl", () => {
  it("ยอมรับลิงก์ http/https", () => {
    expect(safeHttpUrl("https://lin.ee/abc")).toBe("https://lin.ee/abc");
    expect(safeHttpUrl("https://youtube.com/@school")).toBe("https://youtube.com/@school");
    expect(safeHttpUrl("  https://line.me/R/ti/p/@x  ")).toBe("https://line.me/R/ti/p/@x");
  });

  it("คืน null สำหรับ LINE ID, ค่าว่าง และ null", () => {
    expect(safeHttpUrl("@exampleschool")).toBeNull();
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl("   ")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(undefined)).toBeNull();
  });

  it("ปฏิเสธ scheme อันตราย (กัน XSS ใน href)", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>")).toBeNull();
  });
});
