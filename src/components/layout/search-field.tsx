"use client";

import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function SearchField({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return <SearchForm id={id} className={className} defaultQuery={query} />;
}

export function SearchForm({
  id,
  className,
  defaultQuery = "",
}: {
  id: string;
  className?: string;
  defaultQuery?: string;
}) {
  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={cn("relative w-full", className)}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultQuery}
        key={defaultQuery}
        placeholder="Search கற்பூரம், camphor, homam…"
        autoComplete="off"
        className="h-11 w-full rounded-full bg-brand/[0.05] py-2 pl-4 pr-12 text-sm text-text placeholder:text-muted focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
      />
      <button
        type="submit"
        className="absolute right-0.5 top-0.5 inline-flex size-10 items-center justify-center rounded-full text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:size-11"
      >
        <span className="sr-only">Search</span>
        <Icon name="magnifying-glass" className="text-sm" />
      </button>
    </form>
  );
}
