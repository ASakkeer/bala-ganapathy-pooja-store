import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { computeCartTotals, lineTotalPaise } from "@/lib/cart";
import { formatPaise } from "@/lib/money";
import { rupeesToPaise } from "@/lib/paise-parse";
import { isIndianPincode } from "@/lib/pincode";
import { verifyCheckoutSignature, verifyWebhookBody } from "@/lib/razorpay-signature";
import { slugify } from "@/lib/slug";
import { canTransitionOrder } from "@/lib/order-transitions";

describe("money", () => {
  it("formats integer paise as INR", () => {
    expect(formatPaise(129900)).toContain("1,299.00");
    expect(formatPaise(0)).toContain("0.00");
  });

  it("rejects non-integer paise", () => {
    expect(() => formatPaise(10.5)).toThrow();
  });

  it("parses rupee strings into paise", () => {
    expect(rupeesToPaise("129")).toBe(12900);
    expect(rupeesToPaise("129.5")).toBe(12950);
    expect(rupeesToPaise("50.00")).toBe(5000);
    expect(rupeesToPaise("12.345")).toBeNull();
  });
});

describe("cart totals", () => {
  it("adds subtotal and shipping in paise", () => {
    expect(computeCartTotals(19900, 5000)).toEqual({
      subtotalPaise: 19900,
      shippingPaise: 5000,
      grandTotalPaise: 24900,
    });
    expect(lineTotalPaise(8900, 2)).toBe(17800);
  });
});

describe("pincode", () => {
  it("accepts only 6-digit Indian pins", () => {
    expect(isIndianPincode("110001")).toBe(true);
    expect(isIndianPincode("11001")).toBe(false);
    expect(isIndianPincode("1100011")).toBe(false);
    expect(isIndianPincode("11A001")).toBe(false);
  });
});

describe("razorpay signatures", () => {
  it("verifies checkout HMAC", () => {
    const secret = "test_secret";
    const orderId = "order_1";
    const paymentId = "pay_1";
    const signature = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
    expect(verifyCheckoutSignature(orderId, paymentId, signature, secret)).toBe(true);
    expect(verifyCheckoutSignature(orderId, paymentId, "deadbeef", secret)).toBe(false);
  });

  it("verifies webhook HMAC", () => {
    const secret = "whsec";
    const body = `{"event":"payment.captured"}`;
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookBody(body, signature, secret)).toBe(true);
    expect(verifyWebhookBody(body, "nope", secret)).toBe(false);
  });
});

describe("slug and order transitions", () => {
  it("slugifies product names", () => {
    expect(slugify("Demo Camphor 50g")).toBe("demo-camphor-50g");
  });

  it("allows packed after processing only", () => {
    expect(canTransitionOrder("processing", "packed")).toBe(true);
    expect(canTransitionOrder("packed", "processing")).toBe(false);
  });
});
