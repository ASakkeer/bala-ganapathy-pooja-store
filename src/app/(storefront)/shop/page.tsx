import { CatalogView } from "@/components/catalog/catalog-view";
import { parseCatalogParams } from "@/lib/catalog";
import { STORE_NAME } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";
import { listCatalog } from "@/server/queries/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = pageMetadata({
  title: `All products | ${STORE_NAME}`,
  description: "Shop pooja products online — pack sizes, prices, and stock.",
  path: "/shop",
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; inStock?: string; page?: string }>;
}) {
  const params = parseCatalogParams(await searchParams);
  const catalog = await listCatalog({
    sort: params.sort,
    inStockOnly: params.inStockOnly,
    page: params.page,
    pageSize: params.pageSize,
  });

  return (
    <CatalogView
      title="All products"
      description="Everything currently listed online. Filter to in-stock first."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "All products" },
      ]}
      pathname="/shop"
      items={catalog.items}
      total={catalog.total}
      page={catalog.page}
      pageSize={catalog.pageSize}
      sort={params.sort}
      inStockOnly={params.inStockOnly}
    />
  );
}
