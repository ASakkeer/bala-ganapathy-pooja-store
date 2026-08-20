import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog/catalog-view";
import { parseCatalogParams } from "@/lib/catalog";
import { CATEGORIES } from "@/content/catalog";
import { STORE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";
import { getCategoryBySlug, listCatalog } from "@/server/queries/products";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; inStock?: string; page?: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: `Category | ${STORE_NAME}`, robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: `${category.name} | ${STORE_NAME}`,
    description:
      category.description ??
      `Shop ${category.name} online at ${STORE_NAME}. Pack sizes, prices, and stock.`,
    path: `/c/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const query = parseCatalogParams(await searchParams);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const catalog = await listCatalog({
    categorySlug: slug,
    sort: query.sort,
    inStockOnly: query.inStockOnly,
    page: query.page,
    pageSize: query.pageSize,
  });

  const meta = CATEGORIES.find((item) => item.slug === slug);

  return (
    <CatalogView
      title={category.name}
      description={
        [meta?.nameTa, category.description ?? meta?.description]
          .filter(Boolean)
          .join(" — ") ||
        `Shop ${category.name.toLowerCase()}. Prices, pack sizes, and stock on each product.`
      }
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Shop", href: "/shop" },
        { label: category.name },
      ]}
      pathname={`/c/${slug}`}
      items={catalog.items}
      total={catalog.total}
      page={catalog.page}
      pageSize={catalog.pageSize}
      sort={query.sort}
      inStockOnly={query.inStockOnly}
    />
  );
}
