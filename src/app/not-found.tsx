import type { Metadata } from "next";
import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Page not found | ${STORE_NAME}`,
  robots: { index: false, follow: true },
};

export default function RootNotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-bg px-5 py-24 text-center">
      <StoreLogo size="page" className="mx-auto" />
      <p className="mt-8 text-xs tracking-[0.2em] uppercase text-muted">Not found</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">We don’t have this page</h1>
      <p className="mt-3 max-w-md text-muted">Try pooja essentials, or browse everything listed online.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/c/pooja-essentials" className={buttonClassName("primary")}>
          Pooja essentials
        </Link>
        <Link href="/shop" className={buttonClassName("secondary")}>
          All products
        </Link>
      </div>
    </div>
  );
}
