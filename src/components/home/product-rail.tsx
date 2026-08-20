import Link from "next/link";
import { ProductCard, type ProductCardProps } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function ProductRail({
  title,
  description,
  href,
  cta = "View all",
  products,
  layout = "grid",
}: {
  title: string;
  description?: string;
  href?: string;
  cta?: string;
  products: ProductCardProps[];
  layout?: "grid" | "showcase";
}) {
  if (products.length === 0) {
    return null;
  }

  const showcase = layout === "showcase";

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-text md:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-base leading-relaxed text-muted">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="mb-1 inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-brand hover:underline"
          >
            {cta}
            <Icon name="arrow-right" className="text-xs" />
          </Link>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-8",
          showcase
            ? "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
            : "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-6 xl:grid-cols-5 2xl:grid-cols-6",
        )}
      >
        {products.map((product) => (
          <ProductCard key={product.href} {...product} />
        ))}
      </div>
    </section>
  );
}
