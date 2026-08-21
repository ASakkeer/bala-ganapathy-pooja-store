import Link from "next/link";
import { ProductCard, type ProductCardProps } from "@/components/product/product-card";
import { ProductCardSkeletonGrid } from "@/components/product/product-card-skeleton";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function ProductRail({
  title,
  eyebrow,
  description,
  href,
  cta = "View all",
  products,
  layout = "grid",
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  cta?: string;
  products: ProductCardProps[];
  layout?: "grid" | "showcase" | "home";
}) {
  const home = layout === "home";
  const showcase = layout === "showcase";

  const heading = (
    <div className={cn("flex flex-col items-start justify-between gap-4", home ? "mb-6 md:flex-row md:items-end" : "items-end")}>
      <div className={home ? undefined : "max-w-xl"}>
        {eyebrow ? (
          <span className="font-label-caps mb-2 block tracking-wider text-on-surface-variant">
            {eyebrow}
          </span>
        ) : null}
        <h2
          className={
            home
              ? "mb-2 font-serif text-headline-lg text-on-surface"
              : "font-serif text-3xl font-medium tracking-tight text-text md:text-4xl"
          }
        >
          {title}
        </h2>
        {description ? (
          <p
            className={
              home
                ? "max-w-2xl text-base leading-relaxed text-on-surface-variant"
                : "mt-2 text-base leading-relaxed text-muted"
            }
          >
            {description}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className={
            home
              ? "inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              : "mb-1 inline-flex min-h-11 shrink-0 items-center gap-2 text-sm text-brand hover:underline"
          }
        >
          {cta}
          <Icon name={home ? "arrow-right" : "arrow-right"} className="text-xs" />
        </Link>
      ) : null}
    </div>
  );

  const grid =
    products.length === 0 ? (
      home ? (
        <ProductCardSkeletonGrid count={4} tone="home" />
      ) : (
        <div className="mt-8 rounded-home border border-outline-variant/30 bg-surface-container-lowest">
          <EmptyNotice
            title="No records"
            description="No products are listed in this collection yet."
            className="min-h-[16rem] py-12 md:min-h-[18rem]"
          />
        </div>
      )
    ) : (
      <div
        className={cn(
          home
            ? "grid grid-cols-1 gap-grid-gutter sm:grid-cols-2 lg:grid-cols-4"
            : showcase
              ? "mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
              : "mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-6 xl:grid-cols-5 2xl:grid-cols-6",
        )}
      >
        {products.map((product) => (
          <ProductCard key={product.href} {...product} tone={home ? "home" : "catalog"} />
        ))}
      </div>
    );

  if (home) {
    return (
      <FullBleed className="bg-surface-container-low/50">
        <Container className="py-8 md:py-[3.75rem]">
          <section>
            {heading}
            {grid}
          </section>
        </Container>
      </FullBleed>
    );
  }

  return (
    <section>
      {heading}
      {grid}
    </section>
  );
}
