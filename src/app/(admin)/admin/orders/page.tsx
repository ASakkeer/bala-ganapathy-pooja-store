import Link from "next/link";
import { formatPaise } from "@/lib/money";
import { orderStatusLabel } from "@/lib/order-status";
import { listAdminOrders } from "@/server/admin/orders";

export default async function AdminOrdersPage() {
  const orders = await listAdminOrders();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Fulfilment</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Orders</h1>
        <p className="mt-3 max-w-xl text-muted">
          Without a database this list is the orders placed in this server process, plus this
          browser’s order cookie.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-surface ring-1 ring-border/80">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-border/80 text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.publicNumber} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-4 font-medium">{order.publicNumber}</td>
                <td className="px-4 py-4 text-muted">{order.phone}</td>
                <td className="px-4 py-4 text-muted">{orderStatusLabel(order.status)}</td>
                <td className="px-4 py-4 tabular-nums">{formatPaise(order.grandTotalPaise)}</td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.publicNumber)}`}
                    className="text-brand hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted">No orders yet.</p>
        ) : null}
      </div>
    </div>
  );
}
