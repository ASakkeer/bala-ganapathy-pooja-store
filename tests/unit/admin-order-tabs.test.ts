import { describe, expect, it } from "vitest";
import {
  countOrdersForTab,
  orderCanUpdateStatus,
  orderMatchesTab,
  parseAdminOrderTab,
} from "@/lib/admin-order-tabs";

describe("admin order tabs", () => {
  it("defaults to ongoing and groups live fulfilment separately from delivered and cancelled", () => {
    expect(parseAdminOrderTab(undefined)).toBe("ongoing");
    expect(parseAdminOrderTab("cancelled")).toBe("cancelled");
    expect(orderMatchesTab("processing", "ongoing")).toBe(true);
    expect(orderMatchesTab("pending_payment", "ongoing")).toBe(true);
    expect(orderMatchesTab("pending_payment", "awaiting")).toBe(true);
    expect(orderMatchesTab("packed", "preparing")).toBe(true);
    expect(orderMatchesTab("shipped", "shipping")).toBe(true);
    expect(orderMatchesTab("delivered", "ongoing")).toBe(false);
    expect(orderMatchesTab("delivered", "completed")).toBe(true);
    expect(orderMatchesTab("cancelled", "cancelled")).toBe(true);
    expect(orderCanUpdateStatus("shipped")).toBe(true);
    expect(orderCanUpdateStatus("delivered")).toBe(false);
    expect(
      countOrdersForTab(
        [{ status: "packed" as const }, { status: "delivered" as const }, { status: "cancelled" as const }],
        "ongoing",
      ),
    ).toBe(1);
  });
});
