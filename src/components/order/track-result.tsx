"use client";

import { useState } from "react";
import Link from "next/link";
import { OrderProgress } from "@/components/order/order-progress";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { formatPaise } from "@/lib/money";
import {
  formatOrderDate,
  formatOrderWhen,
  orderStatusExplanation,
  orderStatusLabel,
} from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";

const ITEM_PREVIEW = 3;

export type TrackedOrder = {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payable: boolean;
  createdAt: string;
  items: Array<{ name: string; qty: number; pricePaise: number }>;
  subtotalPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  grandTotalPaise: number;
  phoneMasked: string;
  address: {
    name: string;
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

export function TrackResult({
  order,
  phones,
  whatsappUrl,
  onTrackAgain,
}: {
  order: TrackedOrder;
  phones: string[];
  whatsappUrl: string | null;
  onTrackAgain: () => void;
}) {
  const [itemsOpen, setItemsOpen] = useState(false);
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const visibleItems = itemsOpen ? order.items : order.items.slice(0, ITEM_PREVIEW);
  const hiddenCount = order.items.length - visibleItems.length;
  const callPhone = phones[0] ?? null;
  const placedOn = formatOrderDate(order.createdAt);
  const placedWhen = formatOrderWhen(order.createdAt);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-8 md:gap-8 md:py-12">
      <header className="overflow-hidden rounded-[1.25rem] bg-surface px-5 py-6 ring-1 ring-border/80 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.16em] uppercase text-muted">Order</p>
            <h2
              className="mt-1 font-serif text-2xl font-medium tracking-tight break-all md:text-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              tabIndex={-1}
            >
              {order.publicNumber}
            </h2>
            {placedOn ? <p className="mt-1 text-sm text-muted">Placed on {placedOn}</p> : null}
          </div>
          <div className="sm:text-right">
            <p className="font-serif text-2xl tabular-nums md:text-3xl">
              {formatPaise(order.grandTotalPaise)}
            </p>
            <Badge variant={statusBadgeVariant(order.status)} className="mt-2">
              {orderStatusLabel(order.status)}
            </Badge>
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6">
          <section
            className="overflow-hidden rounded-[1.25rem] bg-surface px-5 py-6 ring-1 ring-border/80 sm:px-8"
            aria-labelledby="track-status-heading"
          >
            <p className="text-xs tracking-[0.16em] uppercase text-muted">Current status</p>
            <h3 id="track-status-heading" className="mt-2 font-serif text-2xl tracking-tight">
              {orderStatusLabel(order.status)}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
              {orderStatusExplanation(order.status)}
            </p>
            {placedWhen ? <p className="mt-3 text-sm text-muted">{placedWhen}</p> : null}
            <div className="mt-6 border-t border-border/80 pt-6">
              <OrderProgress status={order.status} />
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {order.payable ? (
              <Link
                href={`/order/confirmation/${encodeURIComponent(order.publicNumber)}`}
                className={buttonClassName("primary")}
              >
                Continue payment
              </Link>
            ) : null}
            <Link href="/contact" className={buttonClassName("secondary")}>
              Contact store
            </Link>
            {callPhone ? (
              <a href={`tel:${callPhone}`} className={buttonClassName("ghost")}>
                Call store
              </a>
            ) : null}
            {whatsappUrl ? (
              <a href={whatsappUrl} className={buttonClassName("ghost")} target="_blank" rel="noreferrer">
                WhatsApp store
              </a>
            ) : null}
            <Link href="/shop" className={buttonClassName("ghost")}>
              Back to shopping
            </Link>
            <button type="button" className={buttonClassName("ghost")} onClick={onTrackAgain}>
              Track again
            </button>
          </div>
        </div>

        <aside className="flex min-w-0 flex-col gap-8 overflow-hidden rounded-[1.25rem] bg-surface px-5 py-6 ring-1 ring-border/80 sm:px-8">
          <section>
            <h3 className="text-xs tracking-[0.16em] uppercase text-muted">Order summary</h3>
            <p className="mt-2 text-sm text-muted">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {visibleItems.map((item) => (
                <li key={`${item.name}-${item.qty}`} className="flex justify-between gap-4">
                  <span className="min-w-0 break-words">
                    {item.name}
                    <span className="text-muted"> × {item.qty}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{formatPaise(item.pricePaise)}</span>
                </li>
              ))}
            </ul>
            {hiddenCount > 0 ? (
              <button
                type="button"
                className="mt-3 inline-flex min-h-11 items-center text-sm text-brand hover:underline"
                onClick={() => setItemsOpen(true)}
              >
                View all items ({order.items.length})
              </button>
            ) : null}
            {itemsOpen && order.items.length > ITEM_PREVIEW ? (
              <button
                type="button"
                className="mt-3 inline-flex min-h-11 items-center text-sm text-brand hover:underline"
                onClick={() => setItemsOpen(false)}
              >
                Show fewer items
              </button>
            ) : null}
            <dl className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatPaise(order.subtotalPaise)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="min-w-0 break-words text-muted">{order.shippingLabel || "Shipping"}</dt>
                <dd className="shrink-0 tabular-nums">
                  {order.shippingPaise === 0 ? "Free" : formatPaise(order.shippingPaise)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 font-medium">
                <dt>Total</dt>
                <dd className="font-serif text-xl tabular-nums">{formatPaise(order.grandTotalPaise)}</dd>
              </div>
            </dl>
          </section>

          <section className="border-t border-border/80 pt-6">
            <h3 className="text-xs tracking-[0.16em] uppercase text-muted">Delivery</h3>
            <address className="mt-3 text-sm leading-relaxed text-text not-italic">
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
            </address>
            {order.phoneMasked ? (
              <p className="mt-3 text-sm text-muted">Mobile {order.phoneMasked}</p>
            ) : null}
            {order.shippingLabel ? (
              <p className="mt-1 text-sm text-muted">{order.shippingLabel}</p>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
