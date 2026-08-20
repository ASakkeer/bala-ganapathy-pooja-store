import Link from "next/link";
import { AccountAvatar, formatAccountPhone } from "@/components/account/account-ui";
import { LogoutButton } from "@/components/auth/logout-button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { isPlaceholderProfileName } from "@/lib/profile-cookie";

type AccountSection = "overview" | "profile" | "orders" | "addresses";

const NAV = [
  {
    label: "Account",
    items: [
      { href: "/account", title: "Overview", section: "overview" as const, icon: "table-columns" },
      { href: "/account/profile", title: "Profile", section: "profile" as const, icon: "user" },
      { href: "/account/orders", title: "Orders", section: "orders" as const, icon: "box" },
      { href: "/account/addresses", title: "Addresses", section: "addresses" as const, icon: "location-dot" },
    ],
  },
  {
    label: "Help",
    items: [
      { href: "/track", title: "Track order", icon: "truck" },
      { href: "/contact", title: "Contact us", icon: "headset" },
    ],
  },
  {
    label: "Legal",
    items: [
      { href: "/policies/privacy", title: "Privacy policy", icon: "shield" },
      { href: "/policies/terms", title: "Terms & conditions", icon: "file-lines" },
    ],
  },
] as const;

export function AccountShell({
  profile,
  current,
  isAdmin = false,
  children,
}: {
  profile: { name: string; phone: string };
  current: AccountSection;
  isAdmin?: boolean;
  children: React.ReactNode;
}) {
  const displayName = isPlaceholderProfileName(profile.name) ? null : profile.name;

  return (
    <div className="mx-auto w-full max-w-6xl py-8 md:py-12">
      <header className="flex items-center gap-4 border-b border-border/80 pb-6">
        <AccountAvatar name={displayName} phone={profile.phone} />
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">Account</h1>
          <p className="mt-1 truncate text-sm text-muted">
            {displayName ?? "Add your name"}
            <span className="text-border"> · </span>
            {formatAccountPhone(profile.phone)}
          </p>
        </div>
      </header>

      <nav
        aria-label="Account sections"
        className="-mx-1 mt-5 flex gap-1 overflow-x-auto pb-1 lg:hidden"
      >
        {[
          { href: "/account", title: "Overview", active: current === "overview" },
          { href: "/account/profile", title: "Profile", active: current === "profile" },
          { href: "/account/orders", title: "Orders", active: current === "orders" },
          { href: "/account/addresses", title: "Addresses", active: current === "addresses" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm",
              item.active ? "bg-brand text-on-brand" : "text-muted hover:text-brand",
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-14">
        <aside className="hidden lg:block">
          <nav aria-label="Account" className="sticky top-28">
            {NAV.map((group) => (
              <div key={group.label} className="border-b border-border/70 py-4 first:pt-0 last:border-b-0">
                <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                  {group.label}
                </p>
                <ul className="mt-2">
                  {group.items.map((item) => {
                    const active = "section" in item && item.section === current;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex min-h-10 items-center gap-2.5 text-sm hover:text-brand",
                            active ? "font-medium text-brand" : "text-text",
                          )}
                        >
                          <Icon name={item.icon} kit={item.icon === "user" ? "regular" : "solid"} className="w-4 text-xs" />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {isAdmin ? (
              <div className="border-b border-border/70 py-4">
                <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">Store</p>
                <Link href="/admin" className="mt-2 flex min-h-10 items-center gap-2.5 text-sm text-text hover:text-brand">
                  <Icon name="gear" className="w-4 text-xs" />
                  Open admin
                </Link>
              </div>
            ) : null}
            <div className="pt-4">
              <LogoutButton variant="ghost" className="h-10 min-h-10 px-0" />
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">{children}</div>
      </div>

      <div className="mt-10 border-t border-border/80 pt-6 lg:hidden">
        <div className="flex flex-col gap-1">
          <Link href="/track" className="flex min-h-11 items-center gap-2.5 text-sm text-text hover:text-brand">
            <Icon name="truck" className="w-4 text-xs" />
            Track order
          </Link>
          <Link href="/contact" className="flex min-h-11 items-center gap-2.5 text-sm text-text hover:text-brand">
            <Icon name="headset" className="w-4 text-xs" />
            Contact us
          </Link>
          <Link href="/policies/privacy" className="flex min-h-11 items-center gap-2.5 text-sm text-text hover:text-brand">
            <Icon name="shield" className="w-4 text-xs" />
            Privacy policy
          </Link>
          <Link href="/policies/terms" className="flex min-h-11 items-center gap-2.5 text-sm text-text hover:text-brand">
            <Icon name="file-lines" className="w-4 text-xs" />
            Terms & conditions
          </Link>
        </div>
        <div className="mt-4">
          <LogoutButton variant="ghost" className="px-0" />
        </div>
      </div>
    </div>
  );
}
