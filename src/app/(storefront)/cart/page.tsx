import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { STORE_NAME } from "@/lib/constants";
import { getCart } from "@/server/cart";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Cart | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const cart = await getCart();

  return <CartView cart={cart} />;
}
