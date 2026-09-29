import { describe, expect, it } from "vitest";
import { type CheckoutInput, hasErrors, localDateString, parseWeeks, validateCheckout } from "./checkout";

const TODAY = "2026-09-29";
const valid: CheckoutInput = { name: "Ada Lovelace", email: "ada@example.com", startDate: "2026-10-05", weeks: "4" };

describe("validateCheckout", () => {
  it("accepts valid details", () => {
    expect(validateCheckout(valid, TODAY)).toEqual({});
  });

  it("accepts a start date of today (local)", () => {
    expect(validateCheckout({ ...valid, startDate: TODAY }, TODAY)).toEqual({});
  });

  it("flags every invalid field", () => {
    const errors = validateCheckout({ name: "  ", email: "not-an-email", startDate: "2026-09-28", weeks: "0" }, TODAY);
    expect(Object.keys(errors).sort()).toEqual(["email", "name", "startDate", "weeks"]);
    expect(hasErrors(errors)).toBe(true);
  });

  it("rejects missing or impossible dates", () => {
    expect(validateCheckout({ ...valid, startDate: "" }, TODAY).startDate).toBeDefined();
    expect(validateCheckout({ ...valid, startDate: "2026-02-30" }, TODAY).startDate).toBeDefined();
  });

  it("rejects non-integer or blank weeks", () => {
    for (const weeks of ["", "1.5", "-2", "abc", "0"]) {
      expect(validateCheckout({ ...valid, weeks }, TODAY).weeks).toBeDefined();
    }
    expect(validateCheckout({ ...valid, weeks: " 12 " }, TODAY).weeks).toBeUndefined();
  });

  it("rejects malformed emails", () => {
    for (const email of ["", "a@b", "a b@c.com", "@c.com"]) {
      expect(validateCheckout({ ...valid, email }, TODAY).email).toBeDefined();
    }
  });
});

describe("helpers", () => {
  it("parseWeeks only accepts whole numbers", () => {
    expect(parseWeeks("3")).toBe(3);
    expect(parseWeeks("3.0")).toBeNaN();
  });

  it("localDateString uses the local calendar date", () => {
    expect(localDateString(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(localDateString(new Date(2026, 11, 31, 0, 1))).toBe("2026-12-31");
  });
});
