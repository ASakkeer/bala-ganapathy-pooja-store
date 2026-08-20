import Image from "next/image";
import Link from "next/link";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { formatPaise } from "@/lib/money";
import type { CartLine } from "@/server/cart";

export function CartLineItem({ item }: { item: CartLine }) {
  const lowStock = item.stockQty > 0 && item.qty >= item.stockQty;

  return (
    <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5 sm:py-6">
      <Link
        href={item.href}
        className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-[#efe4d4] sm:size-[6.5rem]"
      >
        {item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt=""
            fill
            sizes="104px"
            className="object-cover"
          />
        ) : null}
        <span className="sr-only">{item.productName}</span>
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={item.href} className="font-medium text-text hover:text-brand">
              {item.productName}
            </Link>
            <p className="mt-1 text-sm text-muted">{item.variantName}</p>
          </div>
          <p className="shrink-0 font-serif text-lg tabular-nums sm:text-xl">
            {formatPaise(item.linePaise)}
          </p>
        </div>

        {lowStock ? (
          <p className="mt-1 text-sm text-danger">Only {item.stockQty} left</p>
        ) : null}

        <div className="mt-4">
          <CartLineControls
            variantId={item.variantId}
            qty={item.qty}
            stockQty={item.stockQty}
            productName={item.productName}
          />
        </div>
      </div>
    </article>
  );
}
