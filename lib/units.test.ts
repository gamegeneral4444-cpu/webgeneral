import { describe, it, expect } from "vitest";
import { UNITS, findUnit } from "./units";

describe("UNITS", () => {
  it("มีครบ 14 งาน", () => {
    expect(UNITS).toHaveLength(14);
  });

  it("slug ไม่ซ้ำกัน", () => {
    const slugs = UNITS.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("slug เป็น a-z0-9- เท่านั้น", () => {
    for (const u of UNITS) expect(u.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("ชื่องานไม่ซ้ำกัน", () => {
    const labels = UNITS.map((u) => u.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("คำอธิบายที่ใส่ไว้ต้องไม่เป็นข้อความว่าง", () => {
    for (const u of UNITS) {
      if (u.description !== undefined) expect(u.description.trim().length).toBeGreaterThan(0);
    }
  });

  it("มีคำอธิบายครบทุกงาน ยกเว้นงานระบบดูแลช่วยเหลือนักเรียนที่ต้นฉบับยังไม่มี", () => {
    const missing = UNITS.filter((u) => !u.description).map((u) => u.slug);
    expect(missing).toEqual(["student-support"]);
  });

  it("findUnit หาเจอด้วย slug", () => {
    expect(findUnit("building")?.label).toBe("งานอาคารสถานที่");
  });

  it("findUnit คืน undefined เมื่อไม่มี", () => {
    expect(findUnit("ไม่มีงานนี้")).toBeUndefined();
  });
});
