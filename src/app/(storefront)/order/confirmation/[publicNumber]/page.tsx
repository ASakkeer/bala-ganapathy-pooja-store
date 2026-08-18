import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PayButton } from "@/components/checkout/pay-button";
import { OrderTimeline } from "@/components/order/order-timeline";
import { buttonClassName } from "@/components/ui/button";
import { STORE_NAME } from "@/lib/constants";
import { whatsappHref } from "@/lib/contact";
import { formatPaise } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";
import { getSession } from "@/server/auth";
import { orderIsPayable } from "@/server/checkout";
import { isRazorpayConfigured } from "@/server/env";
import { getOwnedOrder } from "@/server/orders";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";

type ConfirmationPageProps = {
  params: Promise<{ publicNumber: string }>;
  searchParams: Promise<{ synced?: string; pay_error?: string }>;
};

export async function generateMetadata({
  params,
}: ConfirmationPageProps): Promise<Metadata> {
  const { publicNumber } = await params;
  return {
    title: `Order ${publicNumber} | ${STORE_NAME}`,
    robots: { index: false, follow: false },
  };
}

function statusCopy(status: string, paymentStatus: string) {
  if (status === "processing" || paymentStatus === "captured") {
    return "Payment is confirmed. The store will pack this order next.";
  }

  if (paymentStatus === "failed") {
    return "Payment did not go through. No money was kept. You can try again.";
  }

  return "Payment is still pending. Use Pay now to open Razorpay. Failed payments stay on this page so you can retry.";
}

export default async function OrderConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const { publicNumber } = await params;
  const query = await searchParams;
  const [order, session, settings] = await Promise.all([
    getOwnedOrder(decodeURIComponent(publicNumber)),
    getSession(),
    getStoreSettings(),
  ]);

  if (!order) {
    notFound();
  }

  if (
    orderIsPayable(order) &&
    order.razorpayOrderId &&
    isRazorpayConfigured() &&
    query.synced !== "1"
  ) {
    const next = `/order/confirmation/${encodeURIComponent(order.publicNumber)}?synced=1`;
    redirect(
      `/api/payments/razorpay/complete?publicNumber=${encodeURIComponent(order.publicNumber)}&sync=1&next=${encodeURIComponent(next)}`,
    );
  }

  const payable = orderIsPayable(order);
  const helpHref = whatsappHref(settings?.whatsapp);
  const trackHref = `/track?order=${encodeURIComponent(order.publicNumber)}`;

  return (
    <div className="flex flex-col gap-8 py-10 md:py-14">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">{orderStatusLabel(order.status)}</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight md:text-5xl">
          {order.publicNumber}
        </h1>
        <p className="mt-4 max-w-lg text-muted">{statusCopy(order.status, order.paymentStatus)}</p>
        {query.pay_error === "1" && payable ? (
          <p className="mt-3 text-sm text-danger">
            Payment was received at Razorpay but this page could not confirm it. Refresh once, or tap
            Pay now only if the amount was not charged.
          </p>
        ) : null}
      </div>
      <section className="grid gap-10 lg:grid-cols-2">
        <OrderTimeline status={order.status} createdAt={order.createdAt} />
        <div className="grid gap-8">
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
          </div>
          <div>
            <h2 className="font-serif text-2xl">Deliver to</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {order.address.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.address.phone}
            </p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Total</dt>
                <dd className="font-serif text-xl tabular-nums">
                  {formatPaise(order.grandTotalPaise)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      <div className="flex flex-wrap items-start gap-3">
        {payable ? <PayButton publicNumber={order.publicNumber} configured={isRazorpayConfigured()} /> : null}
        <Link href={trackHref} className={buttonClassName(payable ? "secondary" : "primary")}>
          Track order
        </Link>
        {session ? (
          <Link
            href={`/account/orders/${encodeURIComponent(order.publicNumber)}`}
            className={buttonClassName("ghost")}
          >
            View in account
          </Link>
        ) : null}
        {helpHref ? (
          <a href={helpHref} className={buttonClassName("ghost")} target="_blank" rel="noreferrer">
            WhatsApp help
          </a>
        ) : null}
        <Link href="/shop" className={buttonClassName("ghost")}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
