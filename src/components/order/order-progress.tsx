import { cn } from "@/lib/cn";
import { orderStatusRank, TRACK_STEPS } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

export function OrderProgress({ status }: { status: OrderStatus }) {
  const rank = orderStatusRank(status);
  const failed = status === "payment_failed";
  const cancelled = status === "cancelled";

  if (cancelled || failed) {
    return null;
  }

  const currentIndex = Math.max(0, Math.min(rank, TRACK_STEPS.length - 1));
  const nextStep = TRACK_STEPS[currentIndex + 1];

  return (
    <div>
      <p className="text-xs tracking-[0.16em] uppercase text-muted">Progress</p>

      <ol className="mt-4 flex items-center" aria-label="Order progress">
        {TRACK_STEPS.map((step, index) => {
          const complete = rank > index;
          const current = rank === index;

          return (
            <li key={step.status} className="flex min-w-0 flex-1 items-center last:flex-none">
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
                  complete && "bg-success text-on-brand",
                  current && "bg-brand text-on-brand",
                  !complete && !current && "bg-border/80 text-muted",
                )}
                aria-current={current ? "step" : undefined}
                aria-label={`${step.title}${complete ? ", completed" : current ? ", current" : ", upcoming"}`}
              >
                {complete ? "✓" : index + 1}
              </span>
              {index < TRACK_STEPS.length - 1 ? (
                <span
                  className={cn("mx-1 h-px min-w-2 flex-1 sm:mx-2", complete ? "bg-success/50" : "bg-border")}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <ul className="mt-3 hidden gap-1 md:grid md:grid-cols-7">
        {TRACK_STEPS.map((step, index) => {
          const complete = rank > index;
          const current = rank === index;

          return (
            <li
              key={`${step.status}-label`}
              className={cn(
                "min-w-0 break-words text-[11px] leading-tight",
                current && "font-medium text-brand",
                complete && "text-text",
                !complete && !current && "text-muted",
              )}
            >
              <span className="xl:hidden">{step.shortTitle}</span>
              <span className="hidden xl:inline">{step.title}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-sm text-muted md:hidden">
        <span className="font-medium text-text">{TRACK_STEPS[currentIndex]?.title}</span>
        {nextStep ? <span> · Next: {nextStep.shortTitle}</span> : null}
      </p>
    </div>
  );
}
