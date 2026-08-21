import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { EmptyNotice } from "@/components/ui/empty-notice";
import type { CartSnapshot } from "@/server/cart";

export function CartView({ cart }: { cart: CartSnapshot }) {
  return (
    <div className="flex flex-col gap-8 py-8 md:py-12 lg:pb-12">
      <header className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Your cart</h1>
            <p className="mt-2 text-sm text-muted sm:text-base">
              {cart.itemCount === 1 ? "1 item" : `${cart.itemCount} items`}
            </p>
          </div>
        </div>
      </header>

      {cart.notices.length > 0 ? (
        <ul
          className="rounded-[1.25rem] bg-accent/15 px-5 py-4 text-sm leading-relaxed text-text ring-1 ring-border/80"
          role="status"
        >
          {cart.notices.map((notice) => (
            <li key={notice}>{notice}</li>
          ))}
        </ul>
      ) : null}

      <div className={`grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] ${cart.items.length > 0 ? "pb-24 lg:pb-0" : ""}`}>
        <section className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
          {cart.items.length === 0 ? (
            <EmptyNotice
              headingAs="h2"
              title="Your cart is empty"
              description="Add products from the shop to see them here."
              className="min-h-[16rem] px-5 py-12 sm:px-6"
            />
          ) : (
            <ul className="divide-y divide-border/80 px-5 sm:px-6">
              {cart.items.map((item) => (
                <li key={item.variantId}>
                  <CartLineItem item={item} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <CartSummary
          items={cart.items}
          itemCount={cart.itemCount}
          subtotalPaise={cart.subtotalPaise}
          shippingPaise={cart.shippingPaise}
          shippingLabel={cart.shippingLabel}
          grandTotalPaise={cart.grandTotalPaise}
        />
      </div>
    </div>
  );
}
