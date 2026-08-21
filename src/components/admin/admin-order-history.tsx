import { cn } from "@/lib/cn";
import {
  adminCancelCopy,
  adminHistoryStepCopy,
  historyStepKind,
} from "@/lib/order-history-copy";
import {
  formatOrderDate,
  formatOrderWhen,
  fulfilmentRank,
  TRACK_STEPS,
} from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";
import type { OrderHistoryEvent } from "@/components/order/order-timeline";

function latestEventFor(events: OrderHistoryEvent[], statuses: OrderStatus[]) {
  return [...events].reverse().find((event) => statuses.includes(event.status));
}

function timeForStep(
  index: number,
  createdAt: string,
  events: OrderHistoryEvent[],
  shippedAt?: string | null,
) {
  const step = TRACK_STEPS[index];
  if (!step) {
    return "";
  }
  if (step.status === "shipped" && shippedAt) {
    return formatOrderWhen(shippedAt) || formatOrderDate(shippedAt);
  }
  const statuses: OrderStatus[] =
    index === 0 ? ["pending_payment", "placed", step.status] : [step.status];
  const event = latestEventFor(events, statuses);
  if (event) {
    return formatOrderWhen(event.at);
  }
  if (index === 0) {
    return formatOrderWhen(createdAt);
  }
  return "";
}

export function AdminOrderHistory({
  status,
  createdAt,
  events = [],
  cancelReason,
  paymentStatus,
  shippedAt,
  amountPaise,
  courierName,
  trackingId,
  trackingUrl,
  trackingLocation,
  city,
}: {
  status: OrderStatus;
  createdAt: string;
  events?: OrderHistoryEvent[];
  cancelReason?: string | null;
  paymentStatus: PaymentStatus;
  shippedAt?: string | null;
  amountPaise: number;
  courierName?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
  trackingLocation?: string | null;
  city?: string | null;
}) {
  const rank = fulfilmentRank(status, events);
  const cancelled = status === "cancelled";
  const failed = status === "payment_failed";
  const cancelledEvent = latestEventFor(events, ["cancelled"]);
  const failedEvent = latestEventFor(events, ["payment_failed"]);
  const unpaid = paymentStatus === "pending" || paymentStatus === "failed" || failed;
  const copyInput = {
    status,
    paymentStatus,
    courierName,
    trackingId,
    trackingLocation,
    city,
    amountPaise,
    cancelReason,
  };

  return (
    <ol className="flex flex-col gap-0">
      {TRACK_STEPS.map((step, index) => {
        const kind = historyStepKind(step.status, status, rank);
        const when = kind === "upcoming" ? "" : timeForStep(index, createdAt, events, shippedAt);
        const copy = adminHistoryStepCopy(step.status, kind, { ...copyInput, when });
        const unpaidPayment =
          step.status === "payment_confirmed" && unpaid && kind === "upcoming";
        const body = unpaidPayment ? "Customer has not paid yet." : copy;
        const complete = kind === "complete";
        const current = kind === "current";
        const dimmed = kind === "upcoming" && !unpaidPayment;
        const showTracking =
          (step.status === "shipped" || step.status === "out_for_delivery" || step.status === "delivered") &&
          (complete || current) &&
          Boolean(trackingUrl);

        if (kind === "upcoming" && !unpaidPayment) {
          return (
            <li key={step.status} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-1 size-3 rounded-full bg-border ring-4 ring-bg" />
                {index < TRACK_STEPS.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
              </div>
              <div className={cn("pb-6", index === TRACK_STEPS.length - 1 && !cancelled && !failed && "pb-0")}>
                <p className="font-medium text-muted">{step.title}</p>
              </div>
            </li>
          );
        }

        return (
          <li key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-3 rounded-full ring-4 ring-bg",
                  current && "bg-brand",
                  complete && "bg-success",
                  unpaidPayment && "bg-border",
                  dimmed && "bg-border",
                )}
              />
              {index < TRACK_STEPS.length - 1 ? (
                <span
                  className={cn(
                    "w-px flex-1",
                    complete || (cancelled && rank > index) ? "bg-success/40" : "bg-border",
                  )}
                />
              ) : cancelled || failed ? (
                <span className="w-px flex-1 bg-danger/30" />
              ) : null}
            </div>
            <div className={cn("pb-6", index === TRACK_STEPS.length - 1 && !cancelled && !failed && "pb-0")}>
              <p className={cn("font-medium", current ? "text-brand" : "text-text")}>{step.title}</p>
              {body ? <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p> : null}
              {showTracking && trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex min-h-11 items-center text-sm text-brand hover:underline"
                >
                  Open courier tracking
                </a>
              ) : null}
            </div>
          </li>
        );
      })}
      {cancelled ? (
        <li className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="mt-1 size-3 rounded-full bg-danger ring-4 ring-bg" />
          </div>
          <div>
            <p className="font-medium text-danger">Cancelled</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {adminCancelCopy({
                ...copyInput,
                when: cancelledEvent ? formatOrderWhen(cancelledEvent.at) : "",
              })}
            </p>
          </div>
        </li>
      ) : null}
      {failed ? (
        <li className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="mt-1 size-3 rounded-full bg-danger ring-4 ring-bg" />
          </div>
          <div>
            <p className="font-medium text-danger">Payment failed</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Customer payment failed
              {failedEvent ? ` on ${formatOrderWhen(failedEvent.at)}` : ""}.
            </p>
          </div>
        </li>
      ) : null}
    </ol>
  );
}
