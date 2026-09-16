import { describe, expect, it } from "vitest";
import { isCategoryTable } from "./category-config";

describe("category table allowlist", () => {
  it("accepts only the three CMS category tables", () => {
    expect(isCategoryTable("news_categories")).toBe(true);
    expect(isCategoryTable("document_categories")).toBe(true);
    expect(isCategoryTable("service_categories")).toBe(true);
    expect(isCategoryTable("profiles")).toBe(false);
  });
});
