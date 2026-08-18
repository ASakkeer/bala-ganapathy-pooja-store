import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CartEmpty } from "@/components/cart/cart-empty";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { formatPaise } from "@/lib/money";
import { getCart } from "@/server/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Cart | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await getCart();

  return (
    <div className="flex flex-col gap-8 py-10 md:py-14">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
      <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Your cart</h1>
      {cart.notices.length > 0 ? (
        <ul className="text-sm text-muted">
          {cart.notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      ) : null}
      {cart.items.length === 0 ? (
        <CartEmpty />
      ) : (
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-start xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
          <ul className="flex flex-col gap-8">
            {cart.items.map((item) => (
              <li
                key={item.variantId}
                className="flex gap-4 border-b border-border/70 pb-8 last:border-b-0"
              >
                <Link href={item.href} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-[#efe4d4] sm:size-28">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.productName}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={item.href} className="font-medium hover:text-brand">
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {item.variantName} · {item.sku}
                  </p>
                  <p className="mt-2 font-serif text-xl tabular-nums">
                    {formatPaise(item.linePaise)}
                  </p>
                  <div className="mt-3">
                    <CartLineControls
                      variantId={item.variantId}
                      qty={item.qty}
                      stockQty={item.stockQty}
                      productName={item.productName}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="rounded-[1.75rem] bg-brand/[0.05] p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPaise(cart.subtotalPaise)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Shipping</dt>
                <dd className="max-w-[12rem] text-right tabular-nums">
                  {formatPaise(cart.shippingPaise)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted">{cart.shippingLabel}</p>
            <dl className="mt-3 text-base">
              <div className="flex justify-between gap-4 border-t border-border/70 pt-3">
                <dt>Total</dt>
                <dd className="font-serif text-2xl tabular-nums">
                  {formatPaise(cart.grandTotalPaise)}
                </dd>
              </div>
            </dl>
            <Link href="/checkout" className={`${buttonClassName("primary")} mt-6 w-full`}>
              Checkout
            </Link>
            <Link href="/shop" className={`${buttonClassName("ghost")} mt-2 w-full`}>
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
