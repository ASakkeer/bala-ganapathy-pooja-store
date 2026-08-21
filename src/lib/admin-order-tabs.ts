import type { OrderStatus } from "@/types";

const AWAITING_STATUSES = ["pending_payment", "placed"] as const;
const PREPARING_STATUSES = ["payment_confirmed", "processing", "packed"] as const;
const SHIPPING_STATUSES = ["shipped", "out_for_delivery"] as const;
const ONGOING_STATUSES = [...AWAITING_STATUSES, ...PREPARING_STATUSES, ...SHIPPING_STATUSES] as const;

export const ADMIN_ORDER_TABS = [
  { id: "ongoing", label: "Ongoing", statuses: ONGOING_STATUSES },
  { id: "awaiting", label: "Awaiting payment", statuses: AWAITING_STATUSES },
  { id: "preparing", label: "Preparing", statuses: PREPARING_STATUSES },
  { id: "shipping", label: "Shipping", statuses: SHIPPING_STATUSES },
  { id: "completed", label: "Completed", statuses: ["delivered"] as const },
  { id: "cancelled", label: "Cancelled", statuses: ["cancelled"] as const },
  { id: "failed", label: "Failed", statuses: ["payment_failed"] as const },
  { id: "all", label: "All", statuses: null },
] as const;

export type AdminOrderTab = (typeof ADMIN_ORDER_TABS)[number]["id"];

const TAB_IDS = new Set<string>(ADMIN_ORDER_TABS.map((tab) => tab.id));

export function parseAdminOrderTab(value: string | undefined): AdminOrderTab {
  if (value && TAB_IDS.has(value)) {
    return value as AdminOrderTab;
  }
  return "ongoing";
}

export function orderMatchesTab(status: OrderStatus, tab: AdminOrderTab) {
  const definition = ADMIN_ORDER_TABS.find((item) => item.id === tab);
  if (!definition || definition.statuses == null) {
    return true;
  }
  return (definition.statuses as readonly OrderStatus[]).includes(status);
}

export function countOrdersForTab<T extends { status: OrderStatus }>(orders: T[], tab: AdminOrderTab) {
  return orders.filter((order) => orderMatchesTab(order.status, tab)).length;
}

export function orderCanUpdateStatus(status: OrderStatus) {
  return status !== "delivered" && status !== "cancelled" && status !== "payment_failed";
}
