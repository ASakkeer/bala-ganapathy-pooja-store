import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderTimeline } from "@/components/order/order-timeline";
import { PayButton } from "@/components/checkout/pay-button";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { loginHref } from "@/lib/login-next";
import { formatPaise } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";
import { getSession } from "@/server/auth";
import { orderIsPayable } from "@/server/checkout";
import { isRazorpayConfigured } from "@/server/env";
import { getOwnedOrder } from "@/server/orders";

export const dynamic = "force-dynamic";

type OrderDetailPageProps = {
  params: Promise<{ publicNumber: string }>;
  searchParams: Promise<{ synced?: string }>;
};

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { publicNumber } = await params;
  return {
    title: `Order ${decodeURIComponent(publicNumber)} | ${STORE_NAME}`,
    robots: { index: false, follow: false },
  };
}

export default async function AccountOrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const session = await getSession();
  if (!session) {
    redirect(loginHref("/account/orders"));
  }

  const { publicNumber } = await params;
  const query = await searchParams;
  const order = await getOwnedOrder(decodeURIComponent(publicNumber));

  if (!order) {
    notFound();
  }

  if (
    orderIsPayable(order) &&
    order.razorpayOrderId &&
    isRazorpayConfigured() &&
    query.synced !== "1"
  ) {
    const next = `/account/orders/${encodeURIComponent(order.publicNumber)}?synced=1`;
    redirect(
      `/api/payments/razorpay/complete?publicNumber=${encodeURIComponent(order.publicNumber)}&sync=1&next=${encodeURIComponent(next)}`,
    );
  }

  const payable = orderIsPayable(order);

  return (
    <div className="flex flex-col gap-8 py-10 md:py-14">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">{orderStatusLabel(order.status)}</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">
          {order.publicNumber}
        </h1>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <OrderTimeline status={order.status} createdAt={order.createdAt} />
        <div>
          <h2 className="font-serif text-2xl">Items</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li key={`${item.name}-${item.qty}`} className="flex justify-between gap-4">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span className="tabular-nums">{formatPaise(item.pricePaise)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 font-serif text-2xl tabular-nums">{formatPaise(order.grandTotalPaise)}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-3">
        {payable ? <PayButton publicNumber={order.publicNumber} configured={isRazorpayConfigured()} /> : null}
        <Link
          href={`/track?order=${encodeURIComponent(order.publicNumber)}`}
          className={buttonClassName("secondary")}
        >
          Track with phone
        </Link>
        <Link href="/account/orders" className={buttonClassName("ghost")}>
          All orders
        </Link>
      </div>
    </div>
  );
}
