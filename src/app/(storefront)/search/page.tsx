import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductGrid } from "@/components/catalog/product-grid";
import { SearchPagination } from "@/components/catalog/search-pagination";
import { toProductCardProps } from "@/components/home/map-product";
import { SectionHeading } from "@/components/ui/section-heading";
import { STORE_NAME } from "@/lib/constants";
import { parseSearchQuery } from "@/lib/search";
import { searchProducts } from "@/server/queries/products";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = parseSearchQuery((await searchParams).q);

  return {
    title: query ? `Search “${query}” | ${STORE_NAME}` : `Search | ${STORE_NAME}`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = parseSearchQuery(params.q);
  const parsedPage = Number(params.page);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const result = await searchProducts(query, { page });
  const products = result.items.map(toProductCardProps).filter((card) => card !== null);

  return (
    <div className="flex flex-col gap-8 py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: query ? `Search “${query}”` : "Search" },
        ]}
      />
      <SectionHeading
        as="h1"
        title={query ? `Results for “${query}”` : "Search"}
        description={
          query
            ? `${result.total} ${result.total === 1 ? "item" : "items"}`
            : "Search by English or Tamil names — karpooram, camphor, kungumam, vilakku."
        }
      />
      <ProductGrid
        products={products}
        emptyTitle={query ? `No records for “${query}”` : "No records"}
        emptyDescription={
          query
            ? "Try another spelling, a Tamil name, or browse a category."
            : "Type a product name to search the catalog."
        }
      />
      {products.length > 0 ? (
        <SearchPagination
          query={query}
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
        />
      ) : null}
    </div>
  );
}
