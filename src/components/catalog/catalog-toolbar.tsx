"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CATALOG_SORT_LABELS,
  CATALOG_SORTS,
  catalogQueryString,
  type CatalogSort,
} from "@/lib/catalog";

export function CatalogToolbar({
  sort,
  inStockOnly,
  resultCount,
}: {
  sort: CatalogSort;
  inStockOnly: boolean;
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filtersOpen, setFiltersOpen] = useState(false);

  function navigate(next: { sort?: CatalogSort; inStockOnly?: boolean }) {
    router.push(
      `${pathname}${catalogQueryString({
        sort: next.sort ?? sort,
        inStockOnly: next.inStockOnly ?? inStockOnly,
        page: 1,
      })}`,
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        {resultCount} {resultCount === 1 ? "item" : "items"}
      </p>
      <div className="hidden items-center gap-3 md:flex">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Sort</span>
          <select
            className="h-11 rounded-full bg-brand/[0.05] px-4 text-sm"
            value={sort}
            onChange={(event) => navigate({ sort: event.target.value as CatalogSort })}
          >
            {CATALOG_SORTS.map((value) => (
              <option key={value} value={value}>
                {CATALOG_SORT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex rounded-full bg-brand/[0.05] p-1">
          <button
            type="button"
            className={`min-h-9 rounded-full px-4 text-sm ${inStockOnly ? "bg-brand text-on-brand" : "text-muted"}`}
            onClick={() => navigate({ inStockOnly: true })}
          >
            In stock
          </button>
          <button
            type="button"
            className={`min-h-9 rounded-full px-4 text-sm ${!inStockOnly ? "bg-brand text-on-brand" : "text-muted"}`}
            onClick={() => navigate({ inStockOnly: false })}
          >
            All
          </button>
        </div>
      </div>
      <Button
        variant="secondary"
        className="md:hidden"
        onClick={() => setFiltersOpen(true)}
      >
        Filter & sort
      </Button>
      {filtersOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-text/30"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] bg-bg px-5 py-6">
            <p className="font-serif text-2xl">Filter & sort</p>
            <label className="mt-6 block text-sm">
              <span className="text-muted">Sort</span>
              <select
                className="mt-2 h-11 w-full rounded-full bg-brand/[0.05] px-4 text-sm"
                value={sort}
                onChange={(event) => {
                  navigate({ sort: event.target.value as CatalogSort });
                  setFiltersOpen(false);
                }}
              >
                {CATALOG_SORTS.map((value) => (
                  <option key={value} value={value}>
                    {CATALOG_SORT_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex gap-2">
              <Button
                variant={inStockOnly ? "primary" : "secondary"}
                className="flex-1"
                onClick={() => {
                  navigate({ inStockOnly: true });
                  setFiltersOpen(false);
                }}
              >
                In stock
              </Button>
              <Button
                variant={!inStockOnly ? "primary" : "secondary"}
                className="flex-1"
                onClick={() => {
                  navigate({ inStockOnly: false });
                  setFiltersOpen(false);
                }}
              >
                All
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
