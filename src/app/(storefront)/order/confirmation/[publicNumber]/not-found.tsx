import Link from "next/link";
import { StoreLogo } from "@/components/brand/store-logo";
import { buttonClassName } from "@/components/ui/button";

export default function OrderConfirmationNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
      <StoreLogo size="page" className="mx-auto" />
      <p className="mt-8 text-xs tracking-[0.2em] uppercase text-muted">Order</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">
        We could not open this order
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The payment page is still here. This order is no longer available in this browser session.
        Place it again from checkout, or track it with the order number and mobile.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/checkout" className={buttonClassName("primary")}>
          Back to checkout
        </Link>
        <Link href="/track" className={buttonClassName("secondary")}>
          Track order
        </Link>
      </div>
    </div>
  );
}
