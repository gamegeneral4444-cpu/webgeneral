import { describe, it, expect } from "vitest";
import { FALLBACK_UNITS, findUnitIn, isValidUnitSlug } from "./units";

describe("FALLBACK_UNITS", () => {
  it("มีครบ 14 งาน", () => {
    expect(FALLBACK_UNITS).toHaveLength(14);
  });

  it("slug ไม่ซ้ำกัน", () => {
    const slugs = FALLBACK_UNITS.map((u) => u.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("ชื่องานไม่ซ้ำกัน", () => {
    const labels = FALLBACK_UNITS.map((u) => u.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("slug ทุกตัวผ่านกติกา", () => {
    for (const u of FALLBACK_UNITS) expect(isValidUnitSlug(u.slug)).toBe(true);
  });

  it("ชื่อไอคอนเป็นข้อความขึ้นต้นด้วยตัวใหญ่", () => {
    for (const u of FALLBACK_UNITS) expect(u.icon).toMatch(/^[A-Z][A-Za-z0-9]*$/);
  });

  it("คำอธิบายที่ใส่ไว้ต้องไม่เป็นข้อความว่าง", () => {
    for (const u of FALLBACK_UNITS) {
      if (u.description !== undefined) expect(u.description.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("isValidUnitSlug", () => {
  it("ยอมรับ a-z 0-9 และขีดกลาง", () => {
    expect(isValidUnitSlug("plan-info")).toBe(true);
    expect(isValidUnitSlug("unit2")).toBe(true);
  });

  it("ไม่ยอมรับตัวใหญ่ ช่องว่าง ภาษาไทย หรือค่าว่าง", () => {
    expect(isValidUnitSlug("Plan")).toBe(false);
    expect(isValidUnitSlug("plan info")).toBe(false);
    expect(isValidUnitSlug("งาน")).toBe(false);
    expect(isValidUnitSlug("")).toBe(false);
  });
});

describe("findUnitIn", () => {
  it("หาเจอด้วย slug", () => {
    expect(findUnitIn(FALLBACK_UNITS, "building")?.label).toBe("งานอาคารสถานที่");
  });

  it("คืน undefined เมื่อไม่มี", () => {
    expect(findUnitIn(FALLBACK_UNITS, "ไม่มีงานนี้")).toBeUndefined();
  });
});
