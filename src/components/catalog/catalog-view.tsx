import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CatalogEmpty } from "@/components/catalog/catalog-empty";
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
      {products.length === 0 ? (
        <CatalogEmpty
          title="Nothing to show yet"
          description="We don’t have items here online yet. Browse daily pooja, or contact the shop."
        />
      ) : (
        <>
          <ProductGrid products={products} />
          <CatalogPagination
            pathname={pathname}
            page={page}
            pageSize={pageSize}
            total={total}
            sort={sort}
            inStockOnly={inStockOnly}
          />
        </>
      )}
    </div>
  );
}
