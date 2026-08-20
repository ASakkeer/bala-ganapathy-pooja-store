import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function AccountAvatar({
  name,
  phone,
}: {
  name: string | null;
  phone: string;
}) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : phone.slice(-2);

  return (
    <span
      aria-hidden
      className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-medium tracking-wide text-on-brand sm:size-[4.5rem] sm:text-xl"
    >
      {initials || "•"}
    </span>
  );
}

export function AccountChevron({ className }: { className?: string }) {
  return <Icon name="chevron-right" className={cn("text-sm", className ?? "text-muted")} />;
}

export function AccountLinkRow({
  href,
  title,
  hint,
}: {
  href: string;
  title: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-12 items-center justify-between gap-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-text group-hover:text-brand">{title}</span>
        {hint ? <span className="mt-0.5 block text-sm text-muted">{hint}</span> : null}
      </span>
      <AccountChevron />
    </Link>
  );
}

export function AccountLinkList({
  labelledBy,
  children,
  className,
}: {
  labelledBy: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav aria-labelledby={labelledBy} className={cn("divide-y divide-border/80", className)}>
      {children}
    </nav>
  );
}

export function formatAccountPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return phone;
  }

  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
