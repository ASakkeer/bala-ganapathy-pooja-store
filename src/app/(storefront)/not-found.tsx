import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { buttonClassName } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <StoreLogo size="page" className="mx-auto" />
      <p className="mt-8 text-xs tracking-[0.2em] uppercase text-muted">Not found</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">
        We don’t have this page
      </h1>
      <p className="mt-3 max-w-md text-muted">
        That category or page isn’t listed yet. Try pooja essentials, or browse everything.
      </p>
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
