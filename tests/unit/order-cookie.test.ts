import { describe, expect, it } from "vitest";
import {
  MAX_ORDER_COOKIE_CHARS,
  decodeOrderCookie,
  encodeOrderCookie,
  fitOrderCookie,
  type StoredOrder,
} from "@/lib/order-cookie";

function sampleOrder(index: number, extra = ""): StoredOrder {
  return {
    id: `00000000-0000-4000-8000-00000000000${index}`,
    publicNumber: `BG-260820-${1000 + index}`,
    userId: "user-9876543210",
    phone: "9876543210",
    address: {
      name: "Test Buyer",
      phone: "9876543210",
      line1: `Address ${index} ${extra}`,
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641002",
    },
    status: "pending_payment",
    paymentStatus: "pending",
    items: [{ name: `Camphor · 50g ${extra}`, qty: 1, pricePaise: 8900 }],
    subtotalPaise: 8900,
    shippingPaise: 0,
    shippingLabel: "Free shipping",
    grandTotalPaise: 8900,
    createdAt: new Date(2026, 7, 20, 0, 0, index).toISOString(),
  };
}

describe("order cookie", () => {
  it("keeps the newest order when older snapshots would overflow the browser limit", () => {
    const bulky = "x".repeat(600);
    const orders = Array.from({ length: 8 }, (_, index) => sampleOrder(index, bulky));
    const fitted = fitOrderCookie({ userId: "user-9876543210", orders });
    const encoded = encodeOrderCookie(fitted);

    expect(fitted.orders[0]?.publicNumber).toBe(orders[0]?.publicNumber);
    expect(fitted.orders.length).toBeGreaterThan(0);
    expect(fitted.orders.length).toBeLessThan(orders.length);
    expect(encoded.length).toBeLessThanOrEqual(MAX_ORDER_COOKIE_CHARS);
    expect(decodeOrderCookie(encoded)?.orders[0]?.publicNumber).toBe(orders[0]?.publicNumber);
  });
});
