import { orderStatusRank } from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";

export type OrderFreshness = {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
};

function isCancelled(status: OrderStatus) {
  return status === "cancelled";
}

/** True when `candidate` is further along than `current` and should replace it. */
export function isFresherOrder(candidate: OrderFreshness, current: OrderFreshness) {
  if (isCancelled(candidate.status) && !isCancelled(current.status)) {
    return true;
  }
  if (isCancelled(current.status) && !isCancelled(candidate.status)) {
    return false;
  }

  const candidateRank = orderStatusRank(candidate.status);
  const currentRank = orderStatusRank(current.status);
  if (candidateRank !== currentRank) {
    return candidateRank > currentRank;
  }

  if (candidate.paymentStatus === "captured" && current.paymentStatus !== "captured") {
    return true;
  }

  if (candidate.razorpayOrderId && !current.razorpayOrderId) {
    return true;
  }

  return false;
}
