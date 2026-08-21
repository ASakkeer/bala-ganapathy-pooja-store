import { formatPaise } from "@/lib/money";
import { orderNeedsRefundNotice } from "@/lib/order-status";
import type { PaymentStatus } from "@/types";

export function OrderCancelNotice({
  reason,
  paymentStatus,
  amountPaise,
}: {
  reason?: string | null;
  paymentStatus: PaymentStatus;
  amountPaise: number;
}) {
  const refund = orderNeedsRefundNotice(paymentStatus);

  return (
    <div className="rounded-[1rem] bg-danger/[0.07] px-4 py-4 ring-1 ring-danger/20 sm:px-5">
      <p className="font-medium text-danger">This order was cancelled.</p>
      {reason ? (
        <p className="mt-2 text-sm leading-relaxed text-text">
          <span className="text-muted">Reason: </span>
          {reason}
        </p>
      ) : null}
      {refund ? (
        <p className="mt-2 text-sm leading-relaxed text-text">
          {formatPaise(amountPaise)} will be refunded to the original payment method in 3–5 working days.
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No payment was taken for this order, so there is nothing to refund.
        </p>
      )}
    </div>
  );
}
