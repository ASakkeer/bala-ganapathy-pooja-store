import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { toProductCardProps } from "@/components/home/map-product";
import { ProductRail } from "@/components/home/product-rail";
import { ProductBuyBox } from "@/components/product/product-buy-box";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductJsonLd } from "@/components/product/product-json-ld";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { getCatalogProduct, HERBAL_DISCLAIMER } from "@/content/catalog";
import { STORE_NAME } from "@/lib/constants";
import { absoluteUrl, pageMetadata } from "@/lib/site";
import { getProductBySlug, listProducts } from "@/server/queries/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const relatedRows = await listProducts({
    categorySlug: product.category.slug,
    inStockOnly: true,
    pageSize: 8,
  });
  const related = relatedRows
    .filter((item) => item.slug !== product.slug)
    .map(toProductCardProps)
    .filter((card) => card !== null)
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-12 py-10 pb-28 md:gap-16 md:py-14 md:pb-14">
      {primary ? (
        <ProductJsonLd
          name={product.name}
          description={product.description}
          images={product.images}
          sku={primary.sku}
          pricePaise={primary.pricePaise}
          inStock={variants.some((variant) => variant.stockQty > 0)}
          url={productUrl(product.slug)}
        />
      ) : null}
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
          {product.description ? (
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              {product.description}
            </p>
          ) : null}
          {product.category.slug === "naattu-marundhu" ? (
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{HERBAL_DISCLAIMER}</p>
          ) : null}
          <div className="mt-8">
            {primary ? (
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
            ) : (
              <div className="rounded-home border border-outline-variant/30 bg-surface-container-lowest">
                <EmptyNotice
                  title="No records"
                  description="This product has no active variants yet."
                  className="min-h-[10rem] py-8"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {product.howToUse ? (
        <section className="border-t border-border/80 pt-10">
          <h2 className="font-serif text-2xl">How to use</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{product.howToUse}</p>
        </section>
      ) : null}
      {related.length > 0 ? <ProductRail title="Related" products={related} /> : null}
    </div>
  );
}
