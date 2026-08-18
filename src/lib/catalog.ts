import { PAGE_SIZE } from "@/lib/constants";

export const CATALOG_SORTS = [
  "featured",
  "price-asc",
  "price-desc",
  "newest",
] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const CATALOG_SORT_LABELS: Record<CatalogSort, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest",
};

export function parseCatalogParams(searchParams: {
  sort?: string;
  inStock?: string;
  page?: string;
}) {
  const sort = CATALOG_SORTS.includes(searchParams.sort as CatalogSort)
    ? (searchParams.sort as CatalogSort)
    : "featured";
  const inStockOnly = searchParams.inStock !== "0";
  const parsedPage = Number(searchParams.page);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  return { sort, inStockOnly, page, pageSize: PAGE_SIZE };
}

export function catalogQueryString(options: {
  sort: CatalogSort;
  inStockOnly: boolean;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (options.sort !== "featured") {
    params.set("sort", options.sort);
  }

  if (!options.inStockOnly) {
    params.set("inStock", "0");
  }

  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
