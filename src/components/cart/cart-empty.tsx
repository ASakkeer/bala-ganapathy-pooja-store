import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function CartEmpty() {
  return (
    <section className="flex flex-col items-center px-2 py-8 text-center sm:py-10">
      <span
        aria-hidden
        className="inline-flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand"
      >
        <Icon name="bag-shopping" className="text-xl" />
      </span>
      <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight">Your cart is empty</h2>
      <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
        Add camphor, kumkum, or a pooja kit, then come back here to review before checkout.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/c/pooja-essentials" className={buttonClassName("primary")}>
          Shop pooja essentials
        </Link>
        <Link href="/shop" className={buttonClassName("secondary")}>
          All products
        </Link>
      </div>
    </section>
  );
}
