import { cn } from "@/lib/cn";

export function ProfileValue({ value }: { value: string | null | undefined }) {
  if (!value?.trim()) {
    return <span className="text-muted">Not added</span>;
  }

  return <span className="text-text">{value}</span>;
}

export function ProfileDetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-baseline gap-1 border-b border-border/70 py-3.5 last:border-b-0 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6",
        className,
      )}
    >
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="min-w-0 text-sm font-medium sm:text-right">{value}</dd>
    </div>
  );
}

export function AccountPanel({
  title,
  titleId,
  action,
  children,
}: {
  title: string;
  titleId?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
      <header className="flex min-h-14 items-center justify-between gap-4 border-b border-border/80 px-5 sm:px-6">
        <h2 id={titleId} className="font-medium tracking-tight text-text">
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}
