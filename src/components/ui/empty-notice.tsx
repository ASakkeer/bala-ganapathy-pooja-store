import { cn } from "@/lib/cn";

export function EmptyNotice({
  title = "No records",
  description,
  className,
  headingAs: Heading = "p",
}: {
  title?: string;
  description?: string;
  className?: string;
  headingAs?: "p" | "h2" | "h3";
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex min-h-[12.5rem] flex-col items-center justify-center px-6 py-10 text-center",
        className,
      )}
    >
      <Heading className="text-sm font-semibold text-on-surface">{title}</Heading>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>
      ) : null}
    </div>
  );
}
