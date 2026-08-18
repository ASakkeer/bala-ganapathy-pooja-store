import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";

export function CartEmpty() {
  return (
    <div className="py-20 text-center">
      <h2 className="font-serif text-3xl font-medium tracking-tight">Your cart is empty</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">
        Add camphor, kumkum, or a pooja kit, then come back here to review before checkout.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/c/pooja-essentials" className={buttonClassName("primary")}>
          Shop pooja essentials
        </Link>
        <Link href="/shop" className={buttonClassName("secondary")}>
          All products
        </Link>
      </div>
    </div>
  );
}
