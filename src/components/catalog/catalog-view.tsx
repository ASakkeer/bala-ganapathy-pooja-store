import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar";
import { ProductGrid } from "@/components/catalog/product-grid";
import { toProductCardProps } from "@/components/home/map-product";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CatalogSort } from "@/lib/catalog";
import type { ListedProduct } from "@/server/queries/products";

export function CatalogView({
  title,
  description,
  breadcrumbs,
  pathname,
  items,
  total,
  page,
  pageSize,
  sort,
  inStockOnly,
}: {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href?: string }[];
  pathname: string;
  items: ListedProduct[];
  total: number;
  page: number;
  pageSize: number;
  sort: CatalogSort;
  inStockOnly: boolean;
}) {
  const products = items.map(toProductCardProps).filter((card) => card !== null);

  return (
    <div className="flex flex-col gap-8 py-10 md:py-14">
      <Breadcrumbs items={breadcrumbs} />
      <SectionHeading as="h1" title={title} description={description} />
      <CatalogToolbar sort={sort} inStockOnly={inStockOnly} resultCount={total} />
      <ProductGrid
        products={products}
        emptyTitle="No records"
        emptyDescription="No products are listed here yet. Add them in admin, or browse another category."
      />
      {products.length > 0 ? (
        <CatalogPagination
          pathname={pathname}
          page={page}
          pageSize={pageSize}
          total={total}
          sort={sort}
          inStockOnly={inStockOnly}
        />
      ) : null}
    </div>
  );
}
