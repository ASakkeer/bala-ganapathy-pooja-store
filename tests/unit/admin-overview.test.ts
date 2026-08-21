import { describe, expect, it } from "vitest";
import { buildAdminOverview } from "@/lib/admin-overview";

describe("admin overview", () => {
  it("counts paid revenue and ignores cancelled captured totals", () => {
    const overview = buildAdminOverview(
      [
        {
          publicNumber: "BG-1",
          status: "delivered",
          paymentStatus: "captured",
          grandTotalPaise: 100000,
          createdAt: "2026-08-21T10:00:00.000Z",
          phone: "9876543210",
        },
        {
          publicNumber: "BG-2",
          status: "cancelled",
          paymentStatus: "captured",
          grandTotalPaise: 50000,
          createdAt: "2026-08-20T10:00:00.000Z",
          phone: "9876543210",
        },
        {
          publicNumber: "BG-3",
          status: "pending_payment",
          paymentStatus: "pending",
          grandTotalPaise: 20000,
          createdAt: "2026-08-21T12:00:00.000Z",
          phone: "9876543210",
        },
      ],
      [
        {
          name: "Camphor",
          slug: "camphor",
          status: "active",
          variants: [{ stockQty: 2, isActive: true }],
        },
        {
          name: "Oil",
          slug: "oil",
          status: "active",
          variants: [{ stockQty: 0, isActive: true }],
        },
      ],
      new Date("2026-08-21T15:00:00.000Z"),
    );

    expect(overview.totals.revenuePaise).toBe(100000);
    expect(overview.totals.paidOrders).toBe(1);
    expect(overview.totals.orders).toBe(3);
    expect(overview.totals.pendingPayment).toBe(1);
    expect(overview.totals.cancelled).toBe(1);
    expect(overview.totals.lowStock).toBe(1);
    expect(overview.totals.outOfStock).toBe(1);
    expect(overview.recent[0]?.publicNumber).toBe("BG-3");
  });
});
