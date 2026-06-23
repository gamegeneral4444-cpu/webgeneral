import { describe, expect, it } from "vitest";
import { sanitizeAuditData } from "./audit";

describe("sanitizeAuditData", () => {
  it("removes sensitive keys recursively", () => {
    expect(sanitizeAuditData({ title: "ข่าว", token: "secret", nested: { api_key: "hidden", value: 2 } })).toEqual({ title: "ข่าว", nested: { value: 2 } });
  });
});
