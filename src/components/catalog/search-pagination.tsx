import { cn } from "@/lib/cn";
import Link from "next/link";

export function SearchPagination({
  query,
  page,
  pageSize,
  total,
}: {
  query: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  if (pageCount <= 1) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-2">
      {pages.map((pageNumber) => {
        const params = new URLSearchParams({ q: query });
        if (pageNumber > 1) {
          params.set("page", String(pageNumber));
        }

        return (
          <Link
            key={pageNumber}
            href={`/search?${params.toString()}`}
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
        );
      })}
    </nav>
  );
}
