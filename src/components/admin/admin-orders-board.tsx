"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatAccountPhone } from "@/components/account/account-ui";
import { useRouter } from "@/components/progress/navigation";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  ADMIN_ORDER_TABS,
  countOrdersForTab,
  orderCanUpdateStatus,
  orderMatchesTab,
  type AdminOrderTab,
} from "@/lib/admin-order-tabs";
import { formatPaise } from "@/lib/money";
import { formatOrderWhen, orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";

export type AdminOrderListItem = {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  grandTotalPaise: number;
  createdAt: string;
  phone: string;
  customerName: string;
  city: string;
  itemCount: number;
};

const PAGE_SIZE = 12;

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

function emptyCopy(tab: AdminOrderTab) {
  switch (tab) {
    case "ongoing":
      return "No live orders right now.";
    case "awaiting":
      return "No orders are waiting for payment.";
    case "preparing":
      return "No orders are being packed at the store.";
    case "shipping":
      return "No orders are with the courier right now.";
    case "completed":
      return "No delivered orders yet.";
    case "cancelled":
      return "No cancelled orders.";
    case "failed":
      return "No failed payments.";
    default:
      return "No orders have been placed yet.";
  }
}

export function AdminOrdersBoard({
  orders,
  initialTab,
}: {
  orders: AdminOrderListItem[];
  initialTab: AdminOrderTab;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/admin/orders";
  const [tab, setTab] = useState<AdminOrderTab>(initialTab);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  function selectTab(next: AdminOrderTab) {
    setTab(next);
    setPage(1);
    const params = new URLSearchParams();
    if (next !== "ongoing") {
      params.set("tab", next);
    }
    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (!orderMatchesTab(order.status, tab)) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return (
        order.publicNumber.toLowerCase().includes(needle) ||
        order.phone.includes(needle.replace(/\s/g, "")) ||
        order.customerName.toLowerCase().includes(needle) ||
        order.city.toLowerCase().includes(needle)
      );
    });
  }, [orders, query, tab]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Order status" className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {ADMIN_ORDER_TABS.map((item) => {
          const count = countOrdersForTab(orders, item.id);
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm",
                active ? "bg-brand text-on-brand" : "text-muted hover:bg-brand/5 hover:text-brand",
              )}
              onClick={() => selectTab(item.id)}
            >
              {item.label}
              <span className={cn("tabular-nums", active ? "text-on-brand/80" : "text-muted")}>{count}</span>
            </button>
          );
        })}
      </nav>

      <section className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-medium tracking-tight">
              {ADMIN_ORDER_TABS.find((item) => item.id === tab)?.label}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? "order" : "orders"}
            </p>
          </div>
          <div className="w-full max-w-xs">
            <Input
              id="order-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search number, name, or phone"
            />
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="border-b border-border/80 text-[0.65rem] font-medium tracking-[0.12em] uppercase text-muted">
              <tr>
                <th className="px-5 py-3 font-medium sm:px-6">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 text-right font-medium sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <EmptyNotice
                      title="No records"
                      description={emptyCopy(tab)}
                      className="min-h-[12rem] py-10"
                    />
                  </td>
                </tr>
              ) : (
                visible.map((order) => {
                  const href = `/admin/orders/${encodeURIComponent(order.publicNumber)}`;
                  const canUpdate = orderCanUpdateStatus(order.status);
                  return (
                    <tr key={order.publicNumber} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-4 align-top sm:px-6">
                        <p className="font-medium text-text">{order.publicNumber}</p>
                        <p className="mt-1 text-xs text-muted">{formatOrderWhen(order.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-text">{order.customerName}</p>
                        <p className="mt-1 text-xs text-muted">
                          {formatAccountPhone(order.phone)}
                          {order.city ? ` · ${order.city}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top tabular-nums text-muted">
                        {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={paymentBadgeVariant(order.paymentStatus)}>
                          {paymentStatusLabel(order.paymentStatus)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant={statusBadgeVariant(order.status)}>
                          {orderStatusLabel(order.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 align-top text-right tabular-nums font-medium">
                        {formatPaise(order.grandTotalPaise)}
                      </td>
                      <td className="px-5 py-4 align-top sm:px-6">
                        <div className="flex flex-wrap justify-end gap-2">
                          {canUpdate ? (
                            <Link href={href} className={buttonClassName("primary", "min-h-10 px-4")}>
                              Update
                            </Link>
                          ) : null}
                          <Link
                            href={href}
                            className={buttonClassName(canUpdate ? "secondary" : "primary", "min-h-10 px-4")}
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 ? (
          <footer className="flex items-center justify-between gap-3 border-t border-border/80 px-5 py-3 text-sm sm:px-6">
            <p className="text-muted">
              Page {safePage} of {pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="min-h-10 px-4"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                className="min-h-10 px-4"
                disabled={safePage >= pages}
                onClick={() => setPage((current) => Math.min(pages, current + 1))}
              >
                Next
              </Button>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
