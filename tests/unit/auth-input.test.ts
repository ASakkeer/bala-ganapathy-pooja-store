import { describe, expect, it } from "vitest";
import { digitsOnlyPhoneInput, normalizeIndianPhone, phoneInputError } from "@/lib/phone";
import { confirmPinError, digitsOnlyPinInput, pinError } from "@/lib/pin";

describe("phone input", () => {
  it("strips spaces, text, and country code before checking", () => {
    expect(digitsOnlyPhoneInput("98765 43210")).toBe("9876543210");
    expect(digitsOnlyPhoneInput("+91 98765-43210")).toBe("9876543210");
    expect(digitsOnlyPhoneInput("abc 98765x43210")).toBe("9876543210");
    expect(phoneInputError("98765 43210")).toBeNull();
    expect(phoneInputError("hello")).toBe("Enter your 10-digit mobile number.");
    expect(phoneInputError("1234567890")).toBe("Indian mobile numbers start with 6, 7, 8, or 9.");
    expect(normalizeIndianPhone("  +91 98765 43210 ")).toBe("9876543210");
  });
});

describe("PIN rules", () => {
  it("accepts a 4-digit non-obvious PIN and matching confirm", () => {
    expect(digitsOnlyPinInput(" 58 26 ")).toBe("5826");
    expect(pinError("5826")).toBeNull();
    expect(confirmPinError("5826", "5826")).toBeNull();
  });

  it("rejects weak, short, or mismatched PINs", () => {
    expect(pinError("1111")).toMatch(/obvious/i);
    expect(pinError("1234")).toMatch(/obvious/i);
    expect(pinError("12")).toMatch(/4-digit/i);
    expect(confirmPinError("5826", "5827")).toMatch(/match/i);
  });
});
