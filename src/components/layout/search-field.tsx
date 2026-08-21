"use client";

import { useSearchParams } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export function SearchField({
  id,
  className,
  tone = "bar",
}: {
  id: string;
  className?: string;
  tone?: "pill" | "bar";
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return <SearchForm id={id} className={className} defaultQuery={query} tone={tone} />;
}

export function SearchForm({
  id,
  className,
  defaultQuery = "",
  tone = "bar",
}: {
  id: string;
  className?: string;
  defaultQuery?: string;
  tone?: "pill" | "bar";
}) {
  const loader = useTopLoader();
  const bar = tone === "bar";

  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={cn("relative w-full", className)}
      onSubmit={() => loader.start()}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      {bar ? (
        <Icon
          name="magnifying-glass"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[1rem] text-on-surface-variant"
        />
      ) : null}
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultQuery}
        key={defaultQuery}
        placeholder={bar ? "Search product, category..." : "Search கற்பூரம், camphor, homam…"}
        autoComplete="off"
        className={
          bar
            ? "h-11 w-full rounded-sm border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 text-sm text-on-surface shadow-sm transition-colors placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            : "h-11 w-full rounded-full bg-brand/[0.05] py-2 pl-4 pr-12 text-sm text-text placeholder:text-muted focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
        }
      />
      <button
        type="submit"
        className={
          bar
            ? "sr-only"
            : "absolute right-0.5 top-0.5 inline-flex size-10 items-center justify-center rounded-full text-brand hover:bg-brand/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:size-11"
        }
      >
        <span className={bar ? undefined : "sr-only"}>Search</span>
        {bar ? null : <Icon name="magnifying-glass" className="text-sm" />}
      </button>
    </form>
  );
}
