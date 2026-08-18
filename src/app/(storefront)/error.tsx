"use client";

import { useEffect } from "react";
import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { buttonClassName } from "@/components/ui/button";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <StoreLogo size="page" className="mx-auto" />
      <p className="mt-8 text-xs tracking-[0.2em] uppercase text-muted">Something went wrong</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">We could not load this page</h1>
      <p className="mt-3 max-w-md text-muted">Try again, or browse the catalog.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" className={buttonClassName("primary")} onClick={() => reset()}>
          Try again
        </button>
        <Link href="/shop" className={buttonClassName("secondary")}>
          All products
        </Link>
      </div>
    </div>
  );
}
