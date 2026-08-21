import type { OrderStatus, PaymentStatus } from "@/types";

export const TRACK_STEPS = [
  {
    status: "pending_payment" as const,
    title: "Order placed",
    shortTitle: "Placed",
    hint: "We have the order.",
  },
  {
    status: "payment_confirmed" as const,
    title: "Payment confirmed",
    shortTitle: "Paid",
    hint: "Payment was received.",
  },
  {
    status: "processing" as const,
    title: "Being prepared",
    shortTitle: "Preparing",
    hint: "The shop is getting the items ready.",
  },
  {
    status: "packed" as const,
    title: "Packed at the store",
    shortTitle: "Packed",
    hint: "Packed and ready to leave the shop.",
  },
  {
    status: "shipped" as const,
    title: "Shipped",
    shortTitle: "Shipped",
    hint: "Handed to the courier.",
  },
  {
    status: "out_for_delivery" as const,
    title: "Out for delivery",
    shortTitle: "Out for delivery",
    hint: "On the way to the delivery address.",
  },
  {
    status: "delivered" as const,
    title: "Delivered",
    shortTitle: "Delivered",
    hint: "Reached the delivery address.",
  },
] as const;

const RANK: Record<OrderStatus, number> = {
  pending_payment: 0,
  placed: 0,
  payment_failed: 0,
  payment_confirmed: 1,
  processing: 2,
  packed: 3,
  shipped: 4,
  out_for_delivery: 5,
  delivered: 6,
  cancelled: -1,
};

export function orderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "pending_payment":
      return "Waiting for payment";
    case "placed":
      return "Order placed";
    case "payment_confirmed":
      return "Payment confirmed";
    case "processing":
      return "Being prepared";
    case "packed":
      return "Packed at the store";
    case "shipped":
      return "Shipped";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    case "payment_failed":
      return "Payment failed";
  }
}

export function paymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "captured":
      return "Paid";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return "Payment pending";
  }
}

export function orderStatusRank(status: OrderStatus) {
  return RANK[status];
}

export function orderStatusExplanation(status: OrderStatus) {
  switch (status) {
    case "pending_payment":
      return "We’ve received your order. Payment is the next step.";
    case "placed":
      return "We’ve received your order. Payment is the next step.";
    case "payment_confirmed":
      return "Payment was received. The shop will prepare the items next.";
    case "processing":
      return "The shop is getting the items ready.";
    case "packed":
      return "Packed and ready to leave the shop.";
    case "shipped":
      return "Handed to the courier and on the way.";
    case "out_for_delivery":
      return "On the way to the delivery address.";
    case "delivered":
      return "Reached the delivery address.";
    case "cancelled":
      return "This order was cancelled.";
    case "payment_failed":
      return "Payment did not go through. No money was kept. You can try again.";
  }
}

export const REFUND_WORKING_DAYS_COPY =
  "The amount will be refunded to the original payment method in 3–5 working days.";

export function orderNeedsRefundNotice(paymentStatus: PaymentStatus) {
  return paymentStatus === "captured" || paymentStatus === "refunded";
}

export function parseCancelReason(value: string) {
  const reason = value.trim().replace(/\s+/g, " ");
  if (reason.length < 8) {
    return { error: "Enter a cancellation reason the customer can read (at least 8 characters).", reason: null };
  }
  if (reason.length > 400) {
    return { error: "Keep the cancellation reason under 400 characters.", reason: null };
  }
  return { error: null, reason };
}

export function fulfilmentRank(status: OrderStatus, events: Array<{ status: OrderStatus }> = []) {
  if (status !== "cancelled" && status !== "payment_failed") {
    return orderStatusRank(status);
  }

  let rank = 0;
  for (const event of events) {
    if (event.status === "cancelled" || event.status === "payment_failed") {
      continue;
    }
    rank = Math.max(rank, orderStatusRank(event.status));
  }
  return rank;
}

export function formatOrderDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatOrderWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
