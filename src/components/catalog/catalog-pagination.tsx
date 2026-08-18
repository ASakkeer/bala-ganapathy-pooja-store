import Link from "next/link";
import { catalogQueryString, type CatalogSort } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export function CatalogPagination({
  pathname,
  page,
  pageSize,
  total,
  sort,
  inStockOnly,
}: {
  pathname: string;
  page: number;
  pageSize: number;
  total: number;
  sort: CatalogSort;
  inStockOnly: boolean;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          href={`${pathname}${catalogQueryString({ sort, inStockOnly, page: pageNumber })}`}
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-full text-sm",
            pageNumber === page
              ? "bg-brand text-on-brand"
              : "text-text hover:bg-brand/5",
          )}
          aria-current={pageNumber === page ? "page" : undefined}
        >
          {pageNumber}
        </Link>
      ))}
    </nav>
  );
}
