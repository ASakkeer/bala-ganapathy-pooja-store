import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { formatPaise } from "@/lib/money";
import { formatOrderWhen, orderStatusLabel } from "@/lib/order-status";
import { getSession } from "@/server/auth";
import { listAccountOrders } from "@/server/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Your orders | ${STORE_NAME}`,
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/account/orders"));
  }

  const orders = await listAccountOrders();

  return (
    <div className="flex flex-col gap-8 py-10 md:py-14">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Account</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">Your orders</h1>
        <p className="mt-4 max-w-lg text-muted">Orders placed with {session.phone}.</p>
      </div>
      {orders.length === 0 ? (
        <div>
          <p className="text-muted">No orders yet.</p>
          <Link href="/shop" className={`${buttonClassName("primary")} mt-6 inline-flex`}>
            Shop pooja items
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.publicNumber}>
              <Link
                href={`/account/orders/${encodeURIComponent(order.publicNumber)}`}
                className="flex flex-col gap-2 rounded-[1.5rem] bg-brand/[0.04] px-5 py-4 ring-1 ring-border/80 hover:ring-brand/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">{order.publicNumber}</p>
                  <p className="text-sm text-brand">{orderStatusLabel(order.status)}</p>
                </div>
                <p className="text-sm text-muted">{formatOrderWhen(order.createdAt)}</p>
                <p className="font-serif text-xl tabular-nums">{formatPaise(order.grandTotalPaise)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/account" className="text-sm text-muted hover:text-brand">
        Back to account
      </Link>
    </div>
  );
}
