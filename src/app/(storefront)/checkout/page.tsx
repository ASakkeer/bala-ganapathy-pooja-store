import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { listAddresses } from "@/server/addresses";
import { getSession } from "@/server/auth";
import { getCart } from "@/server/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Checkout | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await getSession();

  if (!session) {
    redirect(loginHref("/checkout"));
  }

  const [cart, addresses] = await Promise.all([getCart(), listAddresses()]);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="flex flex-col gap-8 py-10 pb-28 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <div>
        <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Checkout</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Add a delivery address here if you do not have one yet, then continue to payment.
        </p>
      </div>
      <CheckoutForm
        addresses={addresses}
        items={cart.items.map((item) => ({
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          qty: item.qty,
          linePaise: item.linePaise,
        }))}
        subtotalPaise={cart.subtotalPaise}
        shippingPaise={cart.shippingPaise}
        shippingLabel={cart.shippingLabel}
        grandTotalPaise={cart.grandTotalPaise}
        initialPhone={session.phone}
      />
    </div>
  );
}
