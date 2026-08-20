import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PaymentReturnSync } from "@/components/checkout/payment-return-sync";
import { OrderInvoice } from "@/components/order/order-invoice";
import { STORE_NAME } from "@/lib/constants";
import { listedPhones, whatsappHref } from "@/lib/contact";
import { getSession } from "@/server/auth";
import { orderIsPayable } from "@/server/checkout";
import { isRazorpayConfigured } from "@/server/env";
import { getOwnedOrder } from "@/server/orders";
import { getStoreSettings } from "@/server/queries/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ConfirmationPageProps = {
  params: Promise<{ publicNumber: string }>;
  searchParams: Promise<{ paid?: string; pay_error?: string; pay_failed?: string }>;
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
    query.paid === "1"
  ) {
    const next = `/order/confirmation/${encodeURIComponent(order.publicNumber)}?paid=1`;
    redirect(
      `/api/payments/razorpay/complete?publicNumber=${encodeURIComponent(order.publicNumber)}&sync=1&next=${encodeURIComponent(next)}`,
    );
  }

  const payable = orderIsPayable(order);
  const failed = order.status === "payment_failed" || order.paymentStatus === "failed";
  const helpHref = whatsappHref(settings?.whatsapp);

  return (
    <>
      <PaymentReturnSync
        publicNumber={order.publicNumber}
        status={order.status}
        paymentStatus={order.paymentStatus}
        payable={payable}
        active={query.paid === "1" || query.pay_error === "1"}
      />
      <OrderInvoice
        order={order}
        payable={payable}
        razorpayConfigured={isRazorpayConfigured()}
        storeAddress={settings?.address}
        storePhones={listedPhones(settings?.phones)}
        helpHref={helpHref}
        showAccountLink={Boolean(session)}
        notices={
          <>
            {query.pay_failed === "1" && payable ? (
              <p className="rounded-full bg-danger/10 px-4 py-2 text-sm text-danger" role="status">
                Payment did not go through. No money was kept. You can tap Pay now to try again.
              </p>
            ) : null}
            {query.pay_error === "1" && payable ? (
              <p className="rounded-full bg-danger/10 px-4 py-2 text-sm text-danger" role="status">
                Payment was received at Razorpay but this page could not confirm it. Refresh once, or tap
                Pay now only if the amount was not charged.
              </p>
            ) : null}
            {query.paid === "1" && !payable && !failed ? (
              <p className="rounded-full bg-success/10 px-4 py-2 text-sm text-success" role="status">
                Payment received. The shop will prepare this order next.
              </p>
            ) : null}
          </>
        }
      />
    </>
  );
}
