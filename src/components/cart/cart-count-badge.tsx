"use client";

import { useCartUi } from "@/components/cart/cart-provider";

export function CartCountBadge() {
  const { itemCount } = useCartUi();

  return (
    <>
      <span className="sr-only">
        Cart, {itemCount} {itemCount === 1 ? "item" : "items"}
      </span>
      {itemCount > 0 ? (
        <span
          aria-hidden
          className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] text-on-brand"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      ) : null}
    </>
  );
}
