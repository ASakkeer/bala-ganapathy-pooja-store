import Link from "next/link";
import { ProductCard, type ProductCardProps } from "@/components/product/product-card";
import { cn } from "@/lib/cn";

export function ProductRail({
  title,
  description,
  href,
  products,
  layout = "grid",
}: {
  title: string;
  description?: string;
  href?: string;
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
            className="mb-1 inline-flex min-h-11 shrink-0 items-center text-sm text-brand hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-8",
          showcase
            ? "-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 xl:grid-cols-5"
            : "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-6 xl:grid-cols-5 2xl:grid-cols-6",
        )}
      >
        {products.map((product) => (
          <ProductCard
            key={product.href}
            {...product}
            className={showcase ? "w-[12.5rem] shrink-0 snap-start sm:w-auto" : undefined}
          />
        ))}
      </div>
    </section>
  );
}
