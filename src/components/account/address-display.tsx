import { cn } from "@/lib/cn";
import type { Address } from "@/types";

export function formatAddressLines(address: Pick<Address, "line1" | "line2" | "city" | "state" | "pincode">) {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
  ].filter(Boolean);
}

export function AddressDisplay({
  address,
  selected = false,
  className,
}: {
  address: Address;
  selected?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.5rem] px-5 py-4 text-left ring-1 transition-colors",
        selected ? "bg-brand/[0.06] ring-brand" : "bg-surface ring-border/80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{address.name}</p>
        {address.isDefault ? (
          <span className="text-xs tracking-[0.14em] uppercase text-brand">Default</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {formatAddressLines(address).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
        <span className="mt-1 block">{address.phone}</span>
      </p>
    </div>
  );
}
