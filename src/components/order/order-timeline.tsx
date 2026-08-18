import { cn } from "@/lib/cn";
import { formatOrderWhen, orderStatusRank, TRACK_STEPS } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

export function OrderTimeline({
  status,
  createdAt,
}: {
  status: OrderStatus;
  createdAt: string;
}) {
  const rank = orderStatusRank(status);
  const failed = status === "payment_failed";
  const cancelled = status === "cancelled";

  return (
    <ol className="flex flex-col gap-0">
      {TRACK_STEPS.map((step, index) => {
        const complete = !cancelled && !failed && rank > index;
        const current = !cancelled && ((failed && index === 0) || (!failed && rank === index));
        const when = index === 0 ? formatOrderWhen(createdAt) : "";

        return (
          <li key={step.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "mt-1 size-3 rounded-full ring-4 ring-bg",
                  current && "bg-brand",
                  complete && "bg-success",
                  failed && index === 0 && "bg-danger",
                  !current && !complete && !(failed && index === 0) && "bg-border",
                )}
              />
              {index < TRACK_STEPS.length - 1 ? (
                <span className={cn("w-px flex-1", complete ? "bg-success/40" : "bg-border")} />
              ) : null}
            </div>
            <div className={cn("pb-6", index === TRACK_STEPS.length - 1 && "pb-0")}>
              <p className={cn("font-medium", current ? "text-brand" : "text-text")}>{step.title}</p>
              <p className="mt-1 text-sm text-muted">{step.hint}</p>
              {when ? <p className="mt-1 text-xs text-muted">{when}</p> : null}
            </div>
          </li>
        );
      })}
      {cancelled ? (
        <li className="pl-7 text-sm text-danger">This order was cancelled.</li>
      ) : null}
      {failed ? (
        <li className="pl-7 text-sm text-danger">Payment failed. You can retry from the order page.</li>
      ) : null}
    </ol>
  );
}
