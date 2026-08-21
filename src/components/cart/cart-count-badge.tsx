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
          className="absolute top-1 right-1 size-2 rounded-full bg-error"
        />
      ) : null}
    </>
  );
}
