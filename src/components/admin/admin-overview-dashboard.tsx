import Link from "next/link";
import { AdminBarChart, AdminMetric, AdminStatusBars } from "@/components/admin/admin-charts";
import { EmptyNotice } from "@/components/ui/empty-notice";
import { buttonClassName } from "@/components/ui/button";
import { formatPaise } from "@/lib/money";
import { formatOrderWhen, orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";
import type { AdminOverview } from "@/lib/admin-overview";

export function AdminOverviewDashboard({
  overview,
  catalogSource,
}: {
  overview: AdminOverview;
  catalogSource: string;
}) {
  const { totals, statusBars, revenueSeries, recent, attention } = overview;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">Admin</p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Overview</h1>
          <p className="mt-3 max-w-xl text-muted">
            Live orders, payments, and catalog health for this store.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/orders" className={buttonClassName("primary")}>
            Orders
          </Link>
          <Link href="/admin/products" className={buttonClassName("secondary")}>
            Products
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric
          label="Revenue"
          value={formatPaise(totals.revenuePaise)}
          hint={totals.paidOrders === 1 ? "1 paid order" : `${totals.paidOrders} paid orders`}
        />
        <AdminMetric
          label="Orders"
          value={String(totals.orders)}
          hint={`${totals.openOrders} still moving`}
        />
        <AdminMetric
          label="Awaiting payment"
          value={String(totals.pendingPayment)}
          hint={`${totals.delivered} delivered`}
        />
        <AdminMetric
          label="Catalog"
          value={String(totals.activeProducts)}
          hint={
            totals.outOfStock > 0
              ? `${totals.outOfStock} out of stock`
              : catalogSource
          }
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.25rem] bg-surface p-5 ring-1 ring-border/80 sm:p-6">
          <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
            Paid revenue · 14 days
          </p>
          <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight">Daily take</h2>
          <div className="mt-6">
            <AdminBarChart
              items={revenueSeries.map((item) => ({
                label: item.label,
                value: Math.round(item.revenuePaise / 100),
              }))}
            />
          </div>
        </article>
        <article className="rounded-[1.25rem] bg-surface p-5 ring-1 ring-border/80 sm:p-6">
          <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
            Fulfilment
          </p>
          <h2 className="mt-2 font-serif text-2xl font-medium tracking-tight">Orders by status</h2>
          <div className="mt-6">
            <AdminStatusBars items={statusBars} total={totals.orders} />
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)]">
        <article className="overflow-hidden rounded-[1.25rem] bg-surface ring-1 ring-border/80">
          <header className="flex items-center justify-between gap-3 border-b border-border/80 px-5 py-4 sm:px-6">
            <h2 className="font-medium tracking-tight">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand hover:underline">
              All orders
            </Link>
          </header>
          {recent.length === 0 ? (
            <EmptyNotice
              title="No records"
              description="Orders will show here after a customer places one."
              className="min-h-[12rem] py-10"
            />
          ) : (
            <ul className="divide-y divide-border/70">
              {recent.map((order) => (
                <li key={order.publicNumber}>
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.publicNumber)}`}
                    className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm hover:bg-brand/[0.03] sm:px-6"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{order.publicNumber}</span>
                      <span className="text-muted">
                        {orderStatusLabel(order.status)} · {paymentStatusLabel(order.paymentStatus)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block tabular-nums">{formatPaise(order.grandTotalPaise)}</span>
                      <span className="text-xs text-muted">{formatOrderWhen(order.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-[1.25rem] bg-surface p-5 ring-1 ring-border/80 sm:p-6">
          <h2 className="font-medium tracking-tight">Needs attention</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                Low stock
              </dt>
              <dd className="mt-2">
                {attention.lowStock.length === 0 ? (
                  <p className="text-muted">None</p>
                ) : (
                  <ul className="space-y-1.5">
                    {attention.lowStock.map((product) => (
                      <li key={product.slug} className="flex justify-between gap-3">
                        <Link href="/admin/products" className="min-w-0 truncate hover:text-brand">
                          {product.name}
                        </Link>
                        <span className="shrink-0 tabular-nums text-muted">{product.stock}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                Out of stock
              </dt>
              <dd className="mt-2">
                {attention.outOfStock.length === 0 ? (
                  <p className="text-muted">None</p>
                ) : (
                  <ul className="space-y-1.5">
                    {attention.outOfStock.map((product) => (
                      <li key={product.slug} className="truncate">
                        <Link href="/admin/products" className="hover:text-brand">
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
            {totals.refundedPaise > 0 ? (
              <div>
                <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                  Marked refunded
                </dt>
                <dd className="mt-2 tabular-nums">{formatPaise(totals.refundedPaise)}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">
                Cancelled
              </dt>
              <dd className="mt-2">{totals.cancelled}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
