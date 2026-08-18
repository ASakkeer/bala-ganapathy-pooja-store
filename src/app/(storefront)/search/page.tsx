import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { ProductGrid } from "@/components/catalog/product-grid";
import { SearchEmpty } from "@/components/catalog/search-empty";
import { SearchPagination } from "@/components/catalog/search-pagination";
import { toProductCardProps } from "@/components/home/map-product";
import { SectionHeading } from "@/components/ui/section-heading";
import { STORE_NAME } from "@/lib/constants";
import { parseSearchQuery } from "@/lib/search";
import { searchProducts } from "@/server/queries/products";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";

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
  const [result, settings] = await Promise.all([
    searchProducts(query, { page }),
    getStoreSettings(),
  ]);
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
      {!query || products.length === 0 ? (
        <SearchEmpty
          title={query ? `No matches for “${query}”` : "Type a product name"}
          description={
            query
              ? "Try another spelling, a Tamil name, or browse a category."
              : "Try karpooram, camphor, kumkum, agarbatti, or vilakku."
          }
          whatsapp={settings?.whatsapp}
        />
      ) : (
        <>
          <ProductGrid products={products} />
          <SearchPagination
            query={query}
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
