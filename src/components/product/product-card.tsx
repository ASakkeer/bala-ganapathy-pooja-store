import Image from "next/image";
import Link from "next/link";
import { ProductCardCart } from "@/components/product/product-card-cart";
import { cn } from "@/lib/cn";
import { formatPaise } from "@/lib/money";
import type { Paise } from "@/types";

export type ProductCardProps = {
  href: string;
  title: string;
  tamilName?: string;
  imageAlt: string;
  imageSrc?: string;
  pricePaise: Paise;
  mrpPaise?: Paise | null;
  inStock: boolean;
  variantId: string;
  stockQty: number;
  className?: string;
  priority?: boolean;
};

export function ProductCard({
  href,
  title,
  tamilName,
  imageAlt,
  imageSrc,
  pricePaise,
  mrpPaise,
  inStock,
  variantId,
  stockQty,
  className,
  priority = false,
}: ProductCardProps) {
  const showMrp = typeof mrpPaise === "number" && mrpPaise > pricePaise;
  const discountPercent =
    showMrp && mrpPaise
      ? Math.round(((mrpPaise - pricePaise) / mrpPaise) * 100)
      : 0;

  return (
    <article className={cn("flex flex-col", className)}>
      <Link
        href={href}
        className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <div className="overflow-hidden bg-[#efe4d4] p-3 sm:p-4">
          <div className="relative aspect-[4/5] overflow-hidden">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority={priority}
                sizes="(min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div
                className="flex size-full items-end bg-[linear-gradient(160deg,#efe4d4_0%,#e4d0b8_100%)] p-4"
                aria-hidden
              >
                <span className="font-serif text-lg text-brand/40">{title}</span>
              </div>
            )}
            {discountPercent >= 5 ? (
              <span className="absolute left-3 top-3 bg-brand px-2 py-1 text-[0.65rem] font-medium tracking-wide text-on-brand">
                {discountPercent}% off
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-1 px-3 pt-3 sm:px-4">
          <h3 className="line-clamp-2 text-[0.95rem] leading-snug text-text transition-colors group-hover:text-brand">
            {title}
          </h3>
          {tamilName ? (
            <p className="font-tamil line-clamp-1 text-sm text-muted">{tamilName}</p>
          ) : null}
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-base font-medium tracking-tight text-text">
              {formatPaise(pricePaise)}
            </span>
            {showMrp ? (
              <span className="text-sm text-muted line-through">{formatPaise(mrpPaise)}</span>
            ) : null}
          </div>
          <span className={cn("text-xs", inStock ? "text-muted" : "text-danger")}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
      </Link>
      <div className="mt-3 px-3 sm:px-4">
        <ProductCardCart
          variantId={variantId}
          stockQty={stockQty}
          productName={title}
          inStock={inStock}
        />
      </div>
    </article>
  );
}
