import { describe, expect, it } from "vitest";
import { normalizeAnalyticsPath } from "./analytics";

describe("normalizeAnalyticsPath", () => {
  it("removes query strings and trailing slashes", () => {
    expect(normalizeAnalyticsPath("/news/?campaign=x")).toBe("/news");
  });

  it("rejects private, API, and external paths", () => {
    expect(normalizeAnalyticsPath("/admin")).toBeNull();
    expect(normalizeAnalyticsPath("/api/test")).toBeNull();
    expect(normalizeAnalyticsPath("/login")).toBeNull();
    expect(normalizeAnalyticsPath("https://example.com/news")).toBeNull();
  });
});
