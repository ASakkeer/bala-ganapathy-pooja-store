import type { OrderStatus } from "@/types";

export function nextOrderStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "pending_payment":
    case "placed":
    case "payment_failed":
      return ["payment_confirmed", "processing", "cancelled"];
    case "payment_confirmed":
      return ["processing", "cancelled"];
    case "processing":
      return ["packed", "cancelled"];
    case "packed":
      return ["shipped"];
    case "shipped":
      return ["out_for_delivery"];
    case "out_for_delivery":
      return ["delivered"];
    default:
      return [];
  }
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return nextOrderStatuses(from).includes(to);
}
