import { cn } from "@/lib/cn";

export function AdminBarChart({
  items,
}: {
  items: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="flex h-44 items-end gap-1.5 sm:gap-2">
      {items.map((item) => {
        const height = Math.max(4, Math.round((item.value / max) * 100));
        return (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <p className="text-[0.65rem] tabular-nums text-muted">
              {item.value > 0 ? formatCompact(item.value) : ""}
            </p>
            <div className="flex h-32 w-full items-end rounded-t-md bg-brand/[0.06]">
              <div
                className="w-full rounded-t-md bg-brand"
                style={{ height: `${height}%` }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <p className="w-full truncate text-center text-[0.65rem] text-muted">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export function AdminStatusBars({
  items,
  total,
}: {
  items: Array<{ label: string; count: number }>;
  total: number;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-text">{item.label}</span>
            <span className="tabular-nums text-muted">{item.count}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand/[0.08]">
            <div
              className={cn("h-full rounded-full bg-brand")}
              style={{ width: `${Math.max(6, Math.round((item.count / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
      {items.length === 0 ? <li className="text-sm text-muted">No orders yet.</li> : null}
      {total > 0 ? <li className="pt-1 text-xs text-muted">{total} orders in view</li> : null}
    </ul>
  );
}

function formatCompact(value: number) {
  if (value >= 100000) {
    return `${Math.round(value / 1000)}k`;
  }
  return String(value);
}

export function AdminMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className="rounded-[1.25rem] bg-surface p-5 ring-1 ring-border/80">
      <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl font-medium tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </article>
  );
}
