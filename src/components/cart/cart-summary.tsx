import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { Icon } from "@/components/ui/icon";
import { formatPaise } from "@/lib/money";
import type { CartLine } from "@/server/cart";

export function CartSummary({
  items,
  itemCount,
  subtotalPaise,
  shippingPaise,
  shippingLabel,
  grandTotalPaise,
}: {
  items: CartLine[];
  itemCount: number;
  subtotalPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  grandTotalPaise: number;
}) {
  const countLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <>
      <aside className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80 lg:sticky lg:top-28">
        <header className="flex items-baseline justify-between gap-4 border-b border-border/80 px-5 py-5 sm:px-6">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-text">Summary</h2>
          <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
            {countLabel}
          </p>
        </header>

        <ul className="px-5 sm:px-6">
          {items.length === 0 ? (
            <li>
              <EmptyNotice
                title="No records"
                description="No items in this order summary yet."
                className="min-h-[7rem] px-0 py-6"
              />
            </li>
          ) : (
            items.map((item) => (
              <li
                key={item.variantId}
                className="flex items-start justify-between gap-4 border-b border-border/70 py-3 last:border-b-0"
              >
                <span className="min-w-0 text-sm leading-snug text-text">
                  {item.productName}
                  <span className="mt-0.5 block text-muted">
                    {item.variantName} × {item.qty}
                  </span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-text">{formatPaise(item.linePaise)}</span>
              </li>
            ))
          )}
        </ul>

        <dl className="space-y-3 border-t border-border/80 px-5 py-4 text-sm sm:px-6">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatPaise(subtotalPaise)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Shipping</dt>
            <dd className="tabular-nums">{formatPaise(shippingPaise)}</dd>
          </div>
        </dl>
        <p className="px-5 text-xs leading-relaxed text-muted sm:px-6">{shippingLabel}</p>

        <dl className="px-5 pb-2 pt-4 sm:px-6">
          <div className="flex items-baseline justify-between gap-4 border-t border-border/80 pt-4">
            <dt className="text-sm font-medium">Total</dt>
            <dd className="font-serif text-2xl tabular-nums">{formatPaise(grandTotalPaise)}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 p-5 sm:p-6">
          {itemCount > 0 ? (
            <Link href="/checkout" className={buttonClassName("primary", "hidden w-full lg:inline-flex")}>
              <Icon name="lock" className="text-sm" />
              Checkout
            </Link>
          ) : null}
          <Link href="/shop" className={buttonClassName("ghost", "w-full")}>
            Continue shopping
          </Link>
        </div>
      </aside>

      {itemCount > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-surface/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-4">
            <div className="min-w-0">
              <p className="text-xs text-muted">{countLabel}</p>
              <p className="font-serif text-xl tabular-nums">{formatPaise(grandTotalPaise)}</p>
            </div>
            <Link href="/checkout" className={buttonClassName("primary", "ml-auto min-w-[9.5rem]")}>
              <Icon name="lock" className="text-sm" />
              Checkout
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
