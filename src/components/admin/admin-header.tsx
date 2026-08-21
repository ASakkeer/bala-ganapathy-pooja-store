"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatAccountPhone } from "@/components/account/account-ui";
import { LogoutButton } from "@/components/auth/logout-button";
import { StoreLogo } from "@/components/brand/store-logo";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { STORE_NAME } from "@/lib/constants";

const LINKS = [
  { href: "/admin", name: "Overview", icon: "chart-simple" },
  { href: "/admin/home", name: "Home", icon: "house" },
  { href: "/admin/products", name: "Products", icon: "boxes-stacked" },
  { href: "/admin/orders", name: "Orders", icon: "receipt" },
  { href: "/admin/settings", name: "Settings", icon: "gear" },
] as const;

const iconClassName =
  "inline-flex size-10 items-center justify-center rounded-full text-brand transition-all hover:bg-brand/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function linkActive(href: string, pathname: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeader({
  name,
  phone,
}: {
  name: string | null;
  phone: string;
}) {
  const pathname = usePathname() ?? "/admin";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/95 backdrop-blur-md">
      <Container className="flex flex-col gap-3 py-3 sm:py-4">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label={STORE_NAME} className="shrink-0">
            <StoreLogo size="admin" decorative />
          </Link>
          <p className="hidden text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted sm:block">
            Admin
          </p>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-medium text-text">{name ?? "Admin"}</p>
              <p className="truncate text-xs text-muted">{formatAccountPhone(phone)}</p>
            </div>
            <Link href="/" aria-label="View shop" className={iconClassName}>
              <Icon name="store" className="text-[1.05rem]" />
            </Link>
            <Link href="/account" aria-label="Your account" className={iconClassName}>
              <Icon name="user" kit="regular" className="text-[1.15rem]" />
            </Link>
            <LogoutButton variant="ghost" className="min-h-10 px-3" />
          </div>
        </div>
        <nav aria-label="Admin" className="-mx-1 flex gap-1 overflow-x-auto pb-0.5">
          {LINKS.map((link) => {
            const active = linkActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-sm",
                  active ? "bg-brand text-on-brand" : "text-muted hover:bg-brand/5 hover:text-brand",
                )}
              >
                <Icon name={link.icon} className="text-xs" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
