"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartUi } from "@/components/cart/cart-provider";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function MiniCartOverlay() {
  const pathname = usePathname();
  const { itemCount, toast } = useCartUi();
  const hidden =
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/login");
  const onProduct = pathname.startsWith("/p/");
  const showBar = !hidden && itemCount > 0;

  if (!toast && !showBar) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-40 flex flex-col items-center gap-2 px-4",
        onProduct ? "bottom-24 sm:bottom-6" : "bottom-6",
      )}
    >
      {toast ? (
        <p
          role="status"
          className="pointer-events-none rounded-full bg-text px-4 py-2 text-sm text-on-brand shadow-[0_12px_30px_rgb(36_28_24_/_0.18)]"
        >
          {toast}
        </p>
      ) : null}
      {showBar ? (
        <div className="pointer-events-auto flex max-w-lg flex-wrap items-center justify-center gap-2 rounded-full bg-surface/95 py-2 pl-5 pr-2 shadow-[0_16px_40px_rgb(36_28_24_/_0.16)] ring-1 ring-border/80 backdrop-blur-xl">
          <p className="text-sm">
            {itemCount} {itemCount === 1 ? "item" : "items"} in cart
          </p>
          <Link href="/cart" className={buttonClassName("ghost", "min-h-10 px-4")}>
            View cart
          </Link>
          <Link href="/checkout" className={buttonClassName("primary", "min-h-10 px-4")}>
            Checkout
          </Link>
        </div>
      ) : null}
    </div>
  );
}
