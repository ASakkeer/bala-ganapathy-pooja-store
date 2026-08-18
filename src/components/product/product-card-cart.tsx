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
}: {
  variantId: string;
  stockQty: number;
  productName: string;
  inStock: boolean;
}) {
  const { qtyFor } = useCartUi();
  const qty = qtyFor(variantId);

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
      <Button type="button" disabled className="w-full px-3">
        Out of stock
      </Button>
    );
  }

  return <AddToCartButton variantId={variantId} qty={1} className="w-full px-3" />;
}
