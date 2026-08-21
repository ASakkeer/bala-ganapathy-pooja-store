import type { ReactNode } from "react";
import Link from "next/link";
import { formatAccountPhone } from "@/components/account/account-ui";
import { AdminOrderHistory } from "@/components/admin/admin-order-history";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatPaise } from "@/lib/money";
import { formatOrderWhen, orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";
import { isShopDelivery } from "@/lib/order-tracking";
import { getAdminOrder } from "@/server/admin/orders";
import type { OrderStatus, PaymentStatus } from "@/types";
import { notFound } from "next/navigation";

function orderBadgeVariant(status: OrderStatus) {
  if (status === "delivered") {
    return "success" as const;
  }
  if (status === "cancelled" || status === "payment_failed") {
    return "danger" as const;
  }
  if (status === "pending_payment" || status === "placed") {
    return "accent" as const;
  }
  return "default" as const;
}

function paymentBadgeVariant(status: PaymentStatus) {
  if (status === "captured") {
    return "success" as const;
  }
  if (status === "refunded") {
    return "success" as const;
  }
  if (status === "failed") {
    return "danger" as const;
  }
  if (status === "pending") {
    return "accent" as const;
  }
  return "default" as const;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs tracking-[0.12em] uppercase text-muted">{label}</dt>
      <dd className="min-w-0 text-sm leading-relaxed text-text">{children}</dd>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ publicNumber: string }>;
}) {
  const { publicNumber } = await params;
  const order = await getAdminOrder(decodeURIComponent(publicNumber));

  if (!order) {
    notFound();
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/orders" className={buttonClassName("ghost", "mb-4 w-fit px-3")}>
          <Icon name="arrow-left" className="text-xs" />
          Back to orders
        </Link>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Fulfilment</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">{order.publicNumber}</h1>
        <p className="mt-3 text-muted">{formatOrderWhen(order.createdAt)}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={orderBadgeVariant(order.status)}>{orderStatusLabel(order.status)}</Badge>
          <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
            {paymentStatusLabel(order.paymentStatus)}
          </Badge>
        </div>
        {order.status === "cancelled" && order.cancelReason ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-danger">
            Cancelled: {order.cancelReason}
          </p>
        ) : null}
        {order.shippedAt ? (
          <p className="mt-3 text-sm text-muted">Shipped {formatOrderWhen(order.shippedAt)}</p>
        ) : null}
        {isShopDelivery(order.courierName) ? (
          <p className="mt-1 text-sm text-muted">
            Shop delivery
            {order.trackingLocation ? ` · ${order.trackingLocation}` : null}
          </p>
        ) : order.trackingId ? (
          <p className="mt-1 text-sm text-muted">
            {order.courierName ? `${order.courierName} · ` : null}
            Tracking {order.trackingId}
            {order.trackingLocation ? ` · ${order.trackingLocation}` : null}
          </p>
        ) : order.courierName ? (
          <p className="mt-1 text-sm text-muted">
            Courier {order.courierName}
            {order.trackingLocation ? ` · ${order.trackingLocation}` : null}
          </p>
        ) : null}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
        <div className="flex min-w-0 flex-col gap-6">
        <section className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border/80">
          <div className="border-b border-border/80 px-5 py-5 sm:px-8">
            <h2 className="font-serif text-2xl font-medium tracking-tight">Items</h2>
            <p className="mt-1 text-sm text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-border/80 text-xs uppercase tracking-[0.12em] text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium sm:px-8">Product</th>
                  <th className="px-3 py-3 text-right font-medium">Qty</th>
                  <th className="px-5 py-3 text-right font-medium sm:px-8">Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={`${item.name}-${index}`} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-4 sm:px-8">
                      <p className="font-medium text-text">{item.name}</p>
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums text-muted">{item.qty}</td>
                    <td className="px-5 py-4 text-right tabular-nums sm:px-8">
                      {formatPaise(item.pricePaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="space-y-2 border-t border-border/80 px-5 py-5 text-sm sm:px-8">
            <div className="flex justify-between gap-6">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPaise(order.subtotalPaise)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="min-w-0 text-muted">{order.shippingLabel || "Shipping"}</dt>
              <dd className="shrink-0 tabular-nums">
                {order.shippingPaise === 0 ? "Free" : formatPaise(order.shippingPaise)}
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-t border-border/70 pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="font-serif text-2xl font-medium tabular-nums">
                {formatPaise(order.grandTotalPaise)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border/80">
          <div className="border-b border-border/80 px-5 py-5 sm:px-8">
            <h2 className="font-serif text-2xl font-medium tracking-tight">Order history</h2>
            <p className="mt-1 text-sm text-muted">What happened on this order, with dates.</p>
          </div>
          <div className="px-5 py-6 sm:px-8">
            <AdminOrderHistory
              status={order.status}
              createdAt={order.createdAt}
              events={order.events}
              cancelReason={order.cancelReason}
              paymentStatus={order.paymentStatus}
              shippedAt={order.shippedAt}
              amountPaise={order.grandTotalPaise}
              courierName={order.courierName}
              trackingId={order.trackingId}
              trackingUrl={order.trackingUrl}
              trackingLocation={order.trackingLocation}
              city={order.address.city}
            />
          </div>
        </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
            <h2 className="font-serif text-2xl font-medium tracking-tight">Customer</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Who placed the order, and where it should go.
            </p>
            <dl className="mt-5 flex flex-col gap-4">
              <DetailRow label="Name">{order.address.name}</DetailRow>
              <DetailRow label="Phone">
                <a href={`tel:${order.phone}`} className="text-brand hover:underline">
                  {formatAccountPhone(order.phone)}
                </a>
              </DetailRow>
              <DetailRow label="Address">
                {order.address.line1}
                {order.address.line2 ? (
                  <>
                    <br />
                    {order.address.line2}
                  </>
                ) : null}
                <br />
                {order.address.city}, {order.address.state} {order.address.pincode}
              </DetailRow>
            </dl>
          </section>

          <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
            <h2 className="font-serif text-2xl font-medium tracking-tight">Payment</h2>
            <dl className="mt-5 flex flex-col gap-4">
              <DetailRow label="Status">
                <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
                  {paymentStatusLabel(order.paymentStatus)}
                </Badge>
              </DetailRow>
              {order.razorpayOrderId ? (
                <DetailRow label="Razorpay">{order.razorpayOrderId}</DetailRow>
              ) : null}
            </dl>
            {order.status === "cancelled" &&
            (order.paymentStatus === "captured" || order.paymentStatus === "refunded") ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Complete the refund in the Razorpay dashboard. The customer is told the amount
                returns in 3–5 working days.
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
            <h2 className="font-serif text-2xl font-medium tracking-tight">Update status</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Now: {orderStatusLabel(order.status)}.
            </p>
            <div className="mt-5">
              <OrderStatusForm
                publicNumber={order.publicNumber}
                status={order.status}
                paymentStatus={order.paymentStatus}
                createdAt={order.createdAt}
                courierName={order.courierName}
                trackingId={order.trackingId}
                trackingUrl={order.trackingUrl}
                trackingLocation={order.trackingLocation}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
