import { cn } from "@/lib/cn";

export type FaKit = "solid" | "regular" | "brands";

export function Icon({
  name,
  kit = "solid",
  className,
}: {
  /** Font Awesome icon name without the `fa-` prefix, e.g. `location-dot`. */
  name: string;
  kit?: FaKit;
  className?: string;
}) {
  const family = kit === "brands" ? "fa-brands" : kit === "regular" ? "fa-regular" : "fa-solid";

  return (
    <i
      className={cn(family, `fa-${name}`, "leading-none", className)}
      aria-hidden
      suppressHydrationWarning
    />
  );
}
