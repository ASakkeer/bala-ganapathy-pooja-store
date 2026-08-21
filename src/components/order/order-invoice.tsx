import type { ReactNode } from "react";
import Link from "next/link";
import { formatAccountPhone } from "@/components/account/account-ui";
import { StoreLogo } from "@/components/brand/store-logo";
import { PayButton } from "@/components/checkout/pay-button";
import { OrderCancelNotice } from "@/components/order/order-cancel-notice";
import { OrderTimeline } from "@/components/order/order-timeline";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { STORE_NAME } from "@/lib/constants";
import { formatPaise } from "@/lib/money";
import { formatOrderWhen, orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";

export type OrderInvoiceData = {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items: Array<{ name: string; qty: number; pricePaise: number }>;
  subtotalPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  grandTotalPaise: number;
  events?: Array<{ status: OrderStatus; at: string; note?: string | null }>;
  cancelReason?: string | null;
  shippedAt?: string | null;
  courierName?: string | null;
  trackingId?: string | null;
  trackingUrl?: string | null;
  trackingLocation?: string | null;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
};

function statusBadgeVariant(status: OrderStatus) {
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
  if (status === "captured" || status === "refunded") {
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

function statusCopy(status: string, paymentStatus: string) {
  if (status === "cancelled") {
    if (paymentStatus === "captured" || paymentStatus === "refunded") {
      return "This order was cancelled. The paid amount will be refunded to the original payment method in 3–5 working days.";
    }
    return "This order was cancelled. No payment was taken.";
  }

  if (status === "processing" || paymentStatus === "captured") {
    return "Payment is confirmed. The store will pack this order next.";
  }

  if (status === "payment_failed" || paymentStatus === "failed") {
    return "Payment did not go through. No money was kept. You can try again.";
  }

  return "Payment is still pending. Use Pay now to open Razorpay. Failed payments stay on this page so you can retry.";
}

export function OrderInvoice({
  order,
  payable,
  razorpayConfigured,
  storeAddress,
  storePhones,
  helpHref,
  notices,
  kicker = "Order confirmation",
  headingAs = "h1",
  compact = false,
  showAccountLink = false,
  showAllOrders = false,
  showContinueShopping = true,
  historyAction,
  headerAction,
  invoiceAction,
}: {
  order: OrderInvoiceData;
  payable: boolean;
  razorpayConfigured: boolean;
  storeAddress?: string | null;
  storePhones?: string[];
  helpHref: string | null;
  notices?: ReactNode;
  kicker?: string;
  headingAs?: "h1" | "h2";
  compact?: boolean;
  showAccountLink?: boolean;
  showAllOrders?: boolean;
  showContinueShopping?: boolean;
  historyAction?: ReactNode;
  headerAction?: ReactNode;
  invoiceAction?: ReactNode;
}) {
  const trackHref = `/track?order=${encodeURIComponent(order.publicNumber)}`;
  const placedWhen = formatOrderWhen(order.createdAt);
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const HeadingTag = headingAs;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 md:gap-8",
        !compact && "mx-auto max-w-3xl py-8 md:py-12",
      )}
    >
      {notices}

      <article className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
        <header className="flex flex-col gap-6 border-b border-border/80 px-5 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8 sm:py-7">
          <div className="min-w-0">
            <StoreLogo size="page" decorative />
            <p className="mt-3 text-sm font-medium">{STORE_NAME}</p>
            {storeAddress ? (
              <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted">{storeAddress}</p>
            ) : null}
            {storePhones && storePhones.length > 0 ? (
              <p className="mt-1 text-sm text-muted">
                {storePhones.map((phone) => formatAccountPhone(phone)).join(" · ")}
              </p>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">{kicker}</p>
            <HeadingTag className="mt-2 font-serif text-2xl font-medium tracking-tight break-all md:text-3xl">
              {order.publicNumber}
            </HeadingTag>
            {placedWhen ? <p className="mt-2 text-sm text-muted">{placedWhen}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge variant={statusBadgeVariant(order.status)}>{orderStatusLabel(order.status)}</Badge>
              <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
                {paymentStatusLabel(order.paymentStatus)}
              </Badge>
            </div>
            {headerAction ? <div className="mt-3 sm:flex sm:justify-end">{headerAction}</div> : null}
          </div>
        </header>

        <p className="border-b border-border/80 bg-brand/[0.04] px-5 py-4 text-sm leading-relaxed text-text sm:px-8">
          {statusCopy(order.status, order.paymentStatus)}
        </p>
        {order.status === "cancelled" ? (
          <div className="border-b border-border/80 px-5 py-4 sm:px-8">
            <OrderCancelNotice
              reason={order.cancelReason}
              paymentStatus={order.paymentStatus}
              amountPaise={order.grandTotalPaise}
            />
          </div>
        ) : null}

        <div className="grid gap-8 border-b border-border/80 px-5 py-6 sm:grid-cols-2 sm:px-8">
          <section>
            <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
              Deliver to
            </p>
            <address className="mt-3 text-sm leading-relaxed not-italic">
              <span className="font-medium">{order.address.name}</span>
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
              {formatAccountPhone(order.address.phone)}
            </address>
          </section>
          <section>
            <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">Payment</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-muted">Status</dt>
                <dd className="font-medium sm:mt-1">{paymentStatusLabel(order.paymentStatus)}</dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-muted">Items</dt>
                <dd className="sm:mt-1">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 sm:block">
                <dt className="text-muted">Amount</dt>
                <dd className="font-serif text-xl tabular-nums sm:mt-1">
                  {formatPaise(order.grandTotalPaise)}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <table className="w-full text-sm">
          <caption className="sr-only">Order items</caption>
          <thead>
            <tr className="border-b border-border/80 text-left text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
              <th className="px-5 py-3 font-medium sm:px-8">Item</th>
              <th className="px-2 py-3 text-right font-medium">Qty</th>
              <th className="px-5 py-3 text-right font-medium sm:px-8">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={`${item.name}-${item.qty}`} className="border-b border-border/70 last:border-b-0">
                <td className="px-5 py-3.5 align-top sm:px-8">
                  {item.name} × {item.qty}
                </td>
                <td className="px-2 py-3.5 align-top text-right tabular-nums text-muted">{item.qty}</td>
                <td className="px-5 py-3.5 align-top text-right tabular-nums sm:px-8">
                  {formatPaise(item.pricePaise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-border/80 px-5 py-5 sm:px-8">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatPaise(order.subtotalPaise)}</dd>
            </div>
            <div className="flex justify-between gap-6">
              <dt className="min-w-0 break-words text-muted">{order.shippingLabel || "Shipping"}</dt>
              <dd className="shrink-0 tabular-nums">
                {order.shippingPaise === 0 ? "Free" : formatPaise(order.shippingPaise)}
              </dd>
            </div>
            <div className="flex justify-between gap-6 border-t border-border/80 pt-3 font-medium">
              <dt>Total</dt>
              <dd className="font-serif text-2xl tabular-nums">{formatPaise(order.grandTotalPaise)}</dd>
            </div>
          </dl>
        </div>
      </article>

      <div className="flex flex-wrap items-start gap-3">
        {payable ? <PayButton publicNumber={order.publicNumber} configured={razorpayConfigured} /> : null}
        {invoiceAction}
        <Link
          href={trackHref}
          className={buttonClassName(payable || invoiceAction ? "secondary" : "primary")}
        >
          Track order
        </Link>
        {showAccountLink ? (
          <Link
            href={`/account/orders/${encodeURIComponent(order.publicNumber)}`}
            className={buttonClassName("ghost")}
          >
            View in account
          </Link>
        ) : null}
        {showAllOrders ? (
          <Link href="/account/orders" className={buttonClassName("ghost")}>
            All orders
          </Link>
        ) : null}
        {helpHref ? (
          <a href={helpHref} className={buttonClassName("ghost")} target="_blank" rel="noreferrer">
            WhatsApp help
          </a>
        ) : null}
        {showContinueShopping ? (
          <Link href="/shop" className={buttonClassName("ghost")}>
            Continue shopping
          </Link>
        ) : null}
      </div>

      <section className="rounded-[1.25rem] bg-surface px-5 py-6 ring-1 ring-border/80 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
            Order history
          </p>
          {historyAction}
        </div>
        <div className="mt-5">
          <OrderTimeline
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
  );
}
