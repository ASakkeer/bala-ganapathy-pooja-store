"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const linkClassName =
  "font-label-caps whitespace-nowrap text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export type NavCategory = {
  slug: string;
  name: string;
  shortName?: string;
};

export function HeaderCategoryNav({
  categories = [],
}: {
  categories?: NavCategory[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Product categories"
      className="hidden w-full items-center justify-center gap-8 overflow-x-auto pt-2 no-scrollbar md:flex"
    >
      {categories.map((category) => {
        const href = `/c/${category.slug}`;
        const active = pathname === href;

        return (
          <Link
            key={category.slug}
            href={href}
            className={cn(linkClassName, active && "border-b-2 border-primary pb-1 text-primary")}
          >
            {category.shortName ?? category.name}
          </Link>
        );
      })}
      <Link
        href="/shop"
        className={cn(
          linkClassName,
          pathname === "/shop" && "border-b-2 border-primary pb-1 text-primary",
        )}
      >
        All Products
      </Link>
    </nav>
  );
}
