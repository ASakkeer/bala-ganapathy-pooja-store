"use client";

import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { useCartUi } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

export function ProductCardCart({
  variantId,
  stockQty,
  productName,
  inStock,
  tone = "catalog",
}: {
  variantId: string;
  stockQty: number;
  productName: string;
  inStock: boolean;
  tone?: "catalog" | "home";
}) {
  const { qtyFor } = useCartUi();
  const qty = qtyFor(variantId);
  const home = tone === "home";

  if (qty > 0) {
    return (
      <CartLineControls
        compact
        variantId={variantId}
        qty={qty}
        stockQty={stockQty}
        productName={productName}
      />
    );
  }

  if (!inStock) {
    return (
      <Button type="button" disabled className="w-full px-3" variant="primary">
        Out of stock
      </Button>
    );
  }

  return (
    <AddToCartButton
      variantId={variantId}
      qty={1}
      variant="primary"
      className={home ? "w-full px-3 font-label-caps" : "w-full px-3"}
    />
  );
}
