import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { getCatalogProduct, HERBAL_DISCLAIMER } from "@/content/catalog";
import { STORE_NAME } from "@/lib/constants";
import { absoluteUrl, pageMetadata } from "@/lib/site";
import { getProductBySlug } from "@/server/queries/products";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function productUrl(slug: string) {
  return absoluteUrl(`/p/${slug}`);
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: `Product | ${STORE_NAME}`, robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: `${product.seoTitle ?? product.name} | ${STORE_NAME}`,
    description: product.seoDescription ?? product.description ?? product.name,
    path: `/p/${product.slug}`,
    images: product.images[0] ? [product.images[0]] : undefined,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const variants = product.variants.filter((variant) => variant.isActive);
  const primary = variants.find((variant) => variant.stockQty > 0) ?? variants[0];
  const content = getCatalogProduct(product.slug);

  if (!primary) {
    notFound();
  }

  const related = (content?.relatedSlugs ?? [])
    .map((relatedSlug) => getCatalogProduct(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <div className="flex flex-col gap-12 py-10 pb-28 md:gap-16 md:py-14 md:pb-14">
      <ProductJsonLd
        name={product.name}
        description={product.description}
        images={product.images}
        sku={primary.sku}
        pricePaise={primary.pricePaise}
        inStock={variants.some((variant) => variant.stockQty > 0)}
        url={productUrl(product.slug)}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          {
            label: product.category.name,
            href: `/c/${product.category.slug}`,
          },
          { label: product.name },
        ]}
      />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery title={product.name} images={product.images} />
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-muted">
            {product.category.name}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">
            {product.name}
          </h1>
          {content?.nameTa ? (
            <p className="font-tamil mt-2 text-xl text-muted">{content.nameTa}</p>
          ) : null}
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
            {content?.shortDescription ?? product.description}
          </p>
          {content?.description && content.description !== content.shortDescription ? (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">{content.description}</p>
          ) : null}
          {product.category.slug === "naattu-marundhu" ? (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{HERBAL_DISCLAIMER}</p>
          ) : null}
          <div className="mt-8">
            <ProductBuyBox
              productName={product.name}
              variants={variants.map((variant) => ({
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                pricePaise: variant.pricePaise,
                mrpPaise: variant.mrpPaise,
                weightGrams: variant.weightGrams,
                stockQty: variant.stockQty,
              }))}
            />
          </div>
        </div>
      </div>
      <section className="border-t border-border/80 pt-10">
        <h2 className="font-serif text-2xl">How to use</h2>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          {product.howToUse ??
            "Use as you would at home. Follow the pack. Ask the shop if you are unsure."}
        </p>
      </section>
      {related.length > 0 ? (
        <section className="border-t border-border/80 pt-10">
          <h2 className="font-serif text-2xl">Related</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/p/${item.slug}`} className="inline-flex min-h-11 items-center text-brand hover:underline">
                  {item.name}
                  <span className="font-tamil ml-2 text-muted">{item.nameTa}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
