import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatPaise } from "@/lib/money";
import { formatOrderWhen, orderStatusLabel } from "@/lib/order-status";
import { getAdminOrder } from "@/server/admin/orders";

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

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">
          {orderStatusLabel(order.status)}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">{order.publicNumber}</h1>
        <p className="mt-3 text-muted">{formatOrderWhen(order.createdAt)}</p>
      </div>
      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80">
        <h2 className="font-serif text-2xl">Customer</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {order.address.name}
          <br />
          {order.phone}
          <br />
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}
          <br />
          {order.address.city}, {order.address.state} {order.address.pincode}
        </p>
      </section>
      <section>
        <h2 className="font-serif text-2xl">Items</h2>
        <ul className="mt-4 divide-y divide-border/80">
          {order.items.map((item) => (
            <li key={`${item.name}-${item.qty}`} className="flex justify-between py-3 text-sm">
              <span>
                {item.name} × {item.qty}
              </span>
              <span className="tabular-nums">{formatPaise(item.pricePaise)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-base font-medium tabular-nums">
          {formatPaise(order.grandTotalPaise)}
        </p>
      </section>
      <OrderStatusForm publicNumber={order.publicNumber} status={order.status} />
    </div>
  );
}
