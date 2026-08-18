"use client";

import Link from "next/link";
import { useState } from "react";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { useCartUi } from "@/components/cart/cart-provider";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatPaise } from "@/lib/money";

export type BuyVariant = {
  id: string;
  name: string;
  sku: string;
  pricePaise: number;
  mrpPaise: number | null;
  weightGrams: number | null;
  stockQty: number;
};

export function ProductBuyBox({
  productName,
  variants,
}: {
  productName: string;
  variants: BuyVariant[];
}) {
  const defaultVariant =
    variants.find((variant) => variant.stockQty > 0) ?? variants[0];
  const { qtyFor } = useCartUi();
  const [variantId, setVariantId] = useState(defaultVariant?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const variant = variants.find((item) => item.id === variantId) ?? defaultVariant;
  const inStock = Boolean(variant && variant.stockQty > 0);
  const maxQty = variant ? Math.max(1, variant.stockQty) : 1;
  const cartQty = variant ? qtyFor(variant.id) : 0;
  const inCart = cartQty > 0;
  const showMrp =
    variant && typeof variant.mrpPaise === "number" && variant.mrpPaise > variant.pricePaise;

  if (!variant) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-baseline gap-3 tabular-nums">
            <p className="font-serif text-3xl text-text">{formatPaise(variant.pricePaise)}</p>
            {showMrp ? (
              <p className="text-muted line-through">{formatPaise(variant.mrpPaise!)}</p>
            ) : null}
          </div>
          <p className={cn("mt-2 text-sm", inStock ? "text-success" : "text-danger")}>
            {inStock ? `In stock · ${variant.stockQty} available` : "Out of stock"}
          </p>
        </div>

        {variants.length > 1 ? (
          <fieldset>
            <legend className="text-xs tracking-[0.16em] uppercase text-muted">Pack size</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {variants.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setVariantId(option.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "min-h-11 rounded-full px-4 text-sm ring-1 transition-colors",
                    option.id === variant.id
                      ? "bg-brand text-on-brand ring-brand"
                      : "text-text ring-border hover:ring-brand/40",
                    option.stockQty <= 0 && "opacity-50",
                  )}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {inCart ? (
          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-muted">In your cart</p>
            <div className="mt-3 max-w-xs">
              <CartLineControls
                compact
                variantId={variant.id}
                qty={cartQty}
                stockQty={variant.stockQty}
                productName={productName}
              />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs tracking-[0.16em] uppercase text-muted">Quantity</p>
            <div className="mt-3 inline-flex items-center rounded-full bg-brand/[0.05]">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center"
                aria-label="Decrease quantity"
                disabled={!inStock || quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <span className="min-w-8 text-center tabular-nums" aria-label="Quantity">
                {quantity}
              </span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center"
                aria-label="Increase quantity"
                disabled={!inStock || quantity >= maxQty}
                onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))}
              >
                +
              </button>
            </div>
          </div>
        )}

        <dl className="space-y-0 text-sm">
          <div className="flex justify-between gap-4 border-b border-border/60 py-3">
            <dt className="text-muted">SKU</dt>
            <dd>{variant.sku}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-border/60 py-3">
            <dt className="text-muted">Pack</dt>
            <dd>{variant.name}</dd>
          </div>
          {variant.weightGrams ? (
            <div className="flex justify-between gap-4 border-b border-border/60 py-3">
              <dt className="text-muted">Weight</dt>
              <dd>{variant.weightGrams}g</dd>
            </div>
          ) : null}
        </dl>

        <div className="hidden flex-col gap-3 sm:flex">
          {inCart ? (
            <Link href="/checkout" className={buttonClassName("primary")}>
              Checkout
            </Link>
          ) : (
            <AddToCartButton variantId={variant.id} qty={quantity} disabled={!inStock} />
          )}
          {inCart ? (
            <Link href="/cart" className={buttonClassName("secondary")}>
              View cart
            </Link>
          ) : (
            <AddToCartButton
              variantId={variant.id}
              qty={quantity}
              disabled={!inStock}
              label="Buy now"
              variant="secondary"
              redirectTo="/checkout"
            />
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted">
          Delivery information is confirmed at checkout. We do not show guessed dates.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-bg/95 px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3 pb-[env(safe-area-inset-bottom)]">
          <p className="min-w-0 flex-1 font-serif text-xl tabular-nums">
            {formatPaise(variant.pricePaise)}
          </p>
          <div className="w-44 shrink-0">
            {inCart ? (
              <Link href="/checkout" className={buttonClassName("primary", "w-full")}>
                Checkout
              </Link>
            ) : (
              <AddToCartButton
                variantId={variant.id}
                qty={quantity}
                disabled={!inStock}
                label={inStock ? "Add to cart" : "Out of stock"}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
