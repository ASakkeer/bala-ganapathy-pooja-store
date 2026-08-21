import Link from "next/link";
import { AccountChevron } from "@/components/account/account-ui";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { formatPaise } from "@/lib/money";
import { formatOrderDate, orderStatusLabel } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

const ITEM_PREVIEW = 2;

export type AccountOrderListItem = {
  publicNumber: string;
  status: OrderStatus;
  createdAt: string;
  payable: boolean;
  items: Array<{ name: string; qty: number }>;
  grandTotalPaise: number;
  city: string;
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

function itemSummary(items: AccountOrderListItem["items"]) {
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const visible = items.slice(0, ITEM_PREVIEW);
  const hidden = items.length - visible.length;
  const names = visible.map((item) => `${item.name} × ${item.qty}`).join(", ");

  return {
    count,
    label: hidden > 0 ? `${names} +${hidden} more` : names,
  };
}

export function AccountOrderList({ orders }: { orders: AccountOrderListItem[] }) {
  if (orders.length === 0) {
    return (
      <EmptyNotice
        title="No records"
        description="No orders yet. Browse the shop when you need pooja items."
        className="min-h-[12rem] px-5 py-10 sm:px-6"
      />
    );
  }

  return (
    <ul>
      {orders.map((order) => {
        const items = itemSummary(order.items);
        const detailHref = `/account/orders/${encodeURIComponent(order.publicNumber)}`;

        return (
          <li key={order.publicNumber} className="border-b border-border/70 last:border-b-0">
            <article className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h3 className="text-sm font-medium text-text">
                    <Link
                      href={detailHref}
                      className="hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                    >
                      {order.publicNumber}
                    </Link>
                  </h3>
                  <Badge variant={statusBadgeVariant(order.status)}>
                    {orderStatusLabel(order.status)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {formatOrderDate(order.createdAt) || "—"}
                  <span className="text-border"> · </span>
                  {items.count} {items.count === 1 ? "item" : "items"}
                  {order.city ? (
                    <>
                      <span className="text-border"> · </span>
                      {order.city}
                    </>
                  ) : null}
                </p>
                {items.label ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text">{items.label}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-end md:justify-start">
                <p className="font-serif text-xl tabular-nums tracking-tight">{formatPaise(order.grandTotalPaise)}</p>
                <div className="flex flex-wrap gap-2">
                  {order.payable ? (
                    <Link
                      href={`/order/confirmation/${encodeURIComponent(order.publicNumber)}`}
                      className={buttonClassName("primary", "px-4")}
                    >
                      Pay now
                    </Link>
                  ) : null}
                  <Link href={detailHref} className={buttonClassName(order.payable ? "secondary" : "primary", "gap-1.5 px-4")}>
                    View details
                    <AccountChevron className={order.payable ? undefined : "text-on-brand"} />
                  </Link>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
