import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { computeCartTotals, lineTotalPaise } from "@/lib/cart";
import { formatPaise } from "@/lib/money";
import { rupeesToPaise } from "@/lib/paise-parse";
import { isIndianPincode } from "@/lib/pincode";
import { verifyCheckoutSignature, verifyWebhookBody } from "@/lib/razorpay-signature";
import { slugify } from "@/lib/slug";
import { canTransitionOrder } from "@/lib/order-transitions";
import { parseCancelReason } from "@/lib/order-status";
import { historyStepCopy, historyStepKind, adminHistoryStepCopy } from "@/lib/order-history-copy";
import { inferDeliveryMethod, parseDeliveryMethod, parseTrackingId } from "@/lib/order-tracking";
import { parseShippedDateInput } from "@/lib/shipped-date";
import { isFresherOrder } from "@/lib/order-freshness";
import { formatInvoiceAmount, orderInvoiceAvailable, orderInvoiceFilename } from "@/lib/order-invoice";

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

describe("order freshness", () => {
  it("prefers a later fulfilment status over a cookie snapshot", () => {
    expect(
      isFresherOrder(
        { status: "packed", paymentStatus: "captured" },
        { status: "payment_confirmed", paymentStatus: "captured" },
      ),
    ).toBe(true);
    expect(
      isFresherOrder(
        { status: "payment_confirmed", paymentStatus: "captured" },
        { status: "packed", paymentStatus: "captured" },
      ),
    ).toBe(false);
  });

  it("treats cancelled as newer than an in-progress status", () => {
    expect(
      isFresherOrder(
        { status: "cancelled", paymentStatus: "captured" },
        { status: "processing", paymentStatus: "captured" },
      ),
    ).toBe(true);
    expect(
      isFresherOrder(
        { status: "processing", paymentStatus: "captured" },
        { status: "cancelled", paymentStatus: "captured" },
      ),
    ).toBe(false);
  });
});

describe("shipped date and cancel reason", () => {
  it("rejects a shipped date before the order was placed", () => {
    const result = parseShippedDateInput("2026-01-01", "2026-08-21T10:00:00+05:30");
    expect(result.error).toBeTruthy();
    expect(result.at).toBeNull();
  });

  it("accepts a cancellation reason the customer can read", () => {
    expect(parseCancelReason("  out of stock  ").reason).toBe("out of stock");
    expect(parseCancelReason("no").error).toBeTruthy();
  });
});

describe("order history copy", () => {
  it("does not ask for payment on a later step", () => {
    const kind = historyStepKind("pending_payment", "processing", 2);
    expect(kind).toBe("complete");
    expect(
      historyStepCopy("pending_payment", kind, {
        status: "processing",
        paymentStatus: "captured",
      }),
    ).toBe("Order received.");
    expect(
      historyStepCopy("payment_confirmed", "complete", {
        status: "processing",
        paymentStatus: "captured",
      }),
    ).toBe("Payment received.");
    expect(
      historyStepCopy("processing", "current", {
        status: "processing",
        paymentStatus: "captured",
      }),
    ).toBe("The shop is getting your items ready.");
    expect(
      historyStepCopy("packed", "upcoming", {
        status: "processing",
        paymentStatus: "captured",
      }),
    ).toBeNull();
  });

  it("asks for payment only while the order is still unpaid", () => {
    expect(
      historyStepCopy("pending_payment", "current", {
        status: "pending_payment",
        paymentStatus: "pending",
      }),
    ).toBe("Waiting for payment.");
  });

  it("includes courier tracking on shipped", () => {
    expect(
      historyStepCopy("shipped", "current", {
        status: "shipped",
        paymentStatus: "captured",
        courierName: "DTDC",
        trackingId: "AWB123456",
        trackingLocation: "Reached Chennai hub",
      }),
    ).toBe("Handed to DTDC. Tracking AWB123456. Reached Chennai hub.");
  });

  it("uses shop-delivery copy when the shop takes the order itself", () => {
    expect(
      historyStepCopy("shipped", "current", {
        status: "shipped",
        paymentStatus: "captured",
        courierName: "Shop delivery",
      }),
    ).toBe("The shop is delivering this order.");
    expect(
      historyStepCopy("packed", "current", {
        status: "packed",
        paymentStatus: "captured",
      }),
    ).toBe("Packed at the shop. Ready to go out.");
  });
});

describe("admin order history copy", () => {
  it("states that the customer placed and paid, with the date in the sentence", () => {
    expect(
      adminHistoryStepCopy("pending_payment", "complete", {
        status: "processing",
        paymentStatus: "captured",
        when: "21 Aug 2026, 8:49 pm",
      }),
    ).toBe("Customer placed the order on 21 Aug 2026, 8:49 pm.");
    expect(
      adminHistoryStepCopy("payment_confirmed", "complete", {
        status: "processing",
        paymentStatus: "captured",
        when: "21 Aug 2026, 8:51 pm",
        amountPaise: 129900,
      }),
    ).toBe("Customer paid ₹1,299.00 on 21 Aug 2026, 8:51 pm.");
  });
});

describe("tracking id", () => {
  it("allows a blank tracking id", () => {
    expect(parseTrackingId("", false).value).toBeNull();
    expect(parseTrackingId("awb-12345", false).value).toBe("AWB-12345");
  });
});

describe("delivery method", () => {
  it("treats shop delivery as store and courier details as courier", () => {
    expect(inferDeliveryMethod("Shop delivery", null, null)).toBe("store");
    expect(inferDeliveryMethod("DTDC", "AWB1", null)).toBe("courier");
    expect(inferDeliveryMethod(null, null, null)).toBe("");
    expect(inferDeliveryMethod(null, null, null, "shipped")).toBe("courier");
    expect(parseDeliveryMethod("").error).toBeTruthy();
    expect(parseDeliveryMethod("store").value).toBe("store");
  });
});

describe("order invoice", () => {
  it("is only available after delivery", () => {
    expect(orderInvoiceAvailable("delivered")).toBe(true);
    expect(orderInvoiceAvailable("shipped")).toBe(false);
    expect(orderInvoiceAvailable("out_for_delivery")).toBe(false);
    expect(orderInvoiceAvailable("cancelled")).toBe(false);
  });

  it("builds a safe pdf filename from the order number", () => {
    expect(orderInvoiceFilename("BG-260821-1234")).toBe("invoice-BG-260821-1234.pdf");
    expect(orderInvoiceFilename("BG/260821")).toBe("invoice-BG-260821.pdf");
  });

  it("formats invoice amounts without the rupee glyph", () => {
    expect(formatInvoiceAmount(129900)).toBe("Rs. 1,299.00");
  });
});
