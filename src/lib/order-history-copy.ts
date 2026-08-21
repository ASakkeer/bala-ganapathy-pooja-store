import { TRACK_STEPS, orderStatusRank } from "@/lib/order-status";
import { formatPaise } from "@/lib/money";
import { isShopDelivery } from "@/lib/order-tracking";
import type { OrderStatus, PaymentStatus } from "@/types";

export type HistoryStepKind = "upcoming" | "current" | "complete";

export type OrderHistoryCopyInput = {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  courierName?: string | null;
  trackingId?: string | null;
  trackingLocation?: string | null;
  city?: string | null;
};

function courierLabel(name?: string | null) {
  const value = name?.trim();
  return value ? value : "the courier";
}

function cityLabel(city?: string | null) {
  const value = city?.trim();
  return value || "";
}

export function historyStepKind(
  stepStatus: (typeof TRACK_STEPS)[number]["status"],
  orderStatus: OrderStatus,
  reachedRank: number,
): HistoryStepKind {
  const stepRank = orderStatusRank(stepStatus);

  if (orderStatus === "cancelled" || orderStatus === "payment_failed") {
    if (stepRank <= reachedRank) {
      return "complete";
    }
    return "upcoming";
  }

  if (stepRank < reachedRank) {
    return "complete";
  }
  if (stepRank === reachedRank) {
    return "current";
  }
  return "upcoming";
}

/** Short line for one timeline step. Upcoming steps return null. */
export function historyStepCopy(
  stepStatus: (typeof TRACK_STEPS)[number]["status"],
  kind: HistoryStepKind,
  input: OrderHistoryCopyInput,
) {
  if (kind === "upcoming") {
    return null;
  }

  const courier = courierLabel(input.courierName);
  const tracking = input.trackingId?.trim() || "";
  const location = input.trackingLocation?.trim() || "";
  const city = cityLabel(input.city);
  const unpaid =
    input.paymentStatus === "pending" ||
    input.paymentStatus === "failed" ||
    input.status === "pending_payment" ||
    input.status === "placed" ||
    input.status === "payment_failed";

  if (stepStatus === "pending_payment") {
    if (kind === "complete" || !unpaid) {
      return "Order received.";
    }
    if (input.status === "payment_failed") {
      return "Waiting for payment. You can retry from the order page.";
    }
    return "Waiting for payment.";
  }

  if (stepStatus === "payment_confirmed") {
    return kind === "current" ? "Payment received. The shop will prepare the items next." : "Payment received.";
  }

  if (stepStatus === "processing") {
    return kind === "current" ? "The shop is getting your items ready." : "Prepared at the shop.";
  }

  if (stepStatus === "packed") {
    return kind === "current" ? "Packed at the shop. Ready to go out." : "Packed at the shop.";
  }

  if (stepStatus === "shipped") {
    const loc = location ? (location.endsWith(".") ? location : `${location}.`) : "";
    if (isShopDelivery(input.courierName)) {
      const handed = "The shop is delivering this order.";
      return loc ? `${handed} ${loc}` : handed;
    }
    const handed = `Handed to ${courier}.`;
    if (tracking && loc) {
      return `${handed} Tracking ${tracking}. ${loc}`;
    }
    if (tracking) {
      return `${handed} Tracking ${tracking}.`;
    }
    return loc ? `${handed} ${loc}` : handed;
  }

  if (stepStatus === "out_for_delivery") {
    const shop = isShopDelivery(input.courierName);
    const base = shop
      ? city
        ? `The shop is on the way to ${city}.`
        : "The shop is on the way."
      : city
        ? `Out for delivery to ${city}.`
        : "Out for delivery.";
    if (kind === "current" && location) {
      const loc = location.endsWith(".") ? location : `${location}.`;
      return `${base} ${loc}`;
    }
    return base;
  }

  if (stepStatus === "delivered") {
    return city ? `Delivered in ${city}.` : "Delivered.";
  }

  return null;
}

export function currentStatusCopy(input: OrderHistoryCopyInput) {
  if (input.status === "cancelled") {
    return "This order was cancelled.";
  }
  if (input.status === "payment_failed") {
    return "Payment did not go through. No money was kept.";
  }

  const step = TRACK_STEPS.find((item) => orderStatusRank(item.status) === orderStatusRank(input.status));
  if (!step) {
    return null;
  }
  return historyStepCopy(step.status, "current", input);
}

export type AdminHistoryCopyInput = OrderHistoryCopyInput & {
  when?: string;
  amountPaise?: number;
  cancelReason?: string | null;
};

function onWhen(when?: string) {
  return when ? ` on ${when}` : "";
}

/** Factual shop-side line. Date belongs in the sentence. Upcoming steps return null. */
export function adminHistoryStepCopy(
  stepStatus: (typeof TRACK_STEPS)[number]["status"],
  kind: HistoryStepKind,
  input: AdminHistoryCopyInput,
) {
  if (kind === "upcoming") {
    return null;
  }

  const when = onWhen(input.when);
  const amount = input.amountPaise != null ? formatPaise(input.amountPaise) : "the amount";
  const courier = courierLabel(input.courierName);
  const tracking = input.trackingId?.trim() || "";
  const location = input.trackingLocation?.trim() || "";
  const city = cityLabel(input.city);
  const paid =
    input.paymentStatus === "captured" || input.paymentStatus === "refunded";

  if (stepStatus === "pending_payment") {
    return `Customer placed the order${when}.`;
  }

  if (stepStatus === "payment_confirmed") {
    if (paid) {
      return `Customer paid ${amount}${when}.`;
    }
    if (input.paymentStatus === "failed" || input.status === "payment_failed") {
      return `Customer payment failed${when}.`;
    }
    return "Customer has not paid yet.";
  }

  if (stepStatus === "processing") {
    return kind === "current"
      ? `Shop is preparing the items${when}.`
      : `Shop prepared the items${when}.`;
  }

  if (stepStatus === "packed") {
    return `Shop packed the order${when}.`;
  }

  if (stepStatus === "shipped") {
    if (isShopDelivery(input.courierName)) {
      const parts = [`Shop is delivering this order itself${when}.`];
      if (location) {
        parts.push(location.endsWith(".") ? location : `${location}.`);
      }
      return parts.join(" ");
    }
    const parts = [`Handed to ${courier}${when}.`];
    if (tracking) {
      parts.push(`Tracking ${tracking}.`);
    }
    if (location) {
      parts.push(location.endsWith(".") ? location : `${location}.`);
    }
    return parts.join(" ");
  }

  if (stepStatus === "out_for_delivery") {
    const where = city ? ` to ${city}` : "";
    const loc = location ? ` ${location.endsWith(".") ? location : `${location}.`}` : "";
    if (isShopDelivery(input.courierName)) {
      return `Shop is on the way${where}${when}.${loc}`;
    }
    return `Out for delivery${where}${when}.${loc}`;
  }

  if (stepStatus === "delivered") {
    const where = city ? ` in ${city}` : "";
    return `Marked delivered${where}${when}.`;
  }

  return null;
}

export function adminCancelCopy(input: AdminHistoryCopyInput) {
  const when = onWhen(input.when);
  const reason = input.cancelReason?.trim();
  if (reason) {
    return `Order cancelled${when}. Reason: ${reason}`;
  }
  return `Order cancelled${when}.`;
}
