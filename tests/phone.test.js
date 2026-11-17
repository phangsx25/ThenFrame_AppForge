import { describe, expect, it } from "vitest";
import { displayContactPhone, normalizeContactPhone } from "../src/lib/phone";

describe("contact phone input", () => {
  it.each(["0181234567", "181234567", "+60181234567", "60181234567", "018 123 4567", "+60 (18) 123-4567"])("normalizes %s without requiring spaces", (input) => {
      expect(normalizeContactPhone(input)).toBe("+60181234567");
      expect(displayContactPhone(input)).toBe("0181234567");
    });
  it("accepts the longer Malaysian mobile format and landlines", () => {
    expect(normalizeContactPhone("1112345678")).toBe("+601112345678");
    expect(normalizeContactPhone("0376543210")).toBe("+60376543210");
  });
  it.each(["", "123", "018123", "0181234567890123", "abc0181234567", "+6018/1234567", "++60181234567"])("rejects %s rather than silently extracting a number", (input) => {
      expect(() => normalizeContactPhone(input)).toThrow();
    });
  it("preserves valid international country codes", () => {
    expect(normalizeContactPhone("+44 20 7946 0018")).toBe("+442079460018");
  });
  it("does not crash legacy history on an older, invalid number", () => {
    expect(displayContactPhone("legacy value")).toBe("legacy value");
  });
});
