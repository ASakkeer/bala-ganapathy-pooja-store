import { AdminOrdersBoard } from "@/components/admin/admin-orders-board";
import { parseAdminOrderTab } from "@/lib/admin-order-tabs";
import { listAdminOrders } from "@/server/admin/orders";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const query = await searchParams;
  const orders = await listAdminOrders();
  const rows = orders.map((order) => ({
    publicNumber: order.publicNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    grandTotalPaise: order.grandTotalPaise,
    createdAt: order.createdAt,
    phone: order.phone,
    customerName: order.address.name,
    city: order.address.city,
    itemCount: order.items.reduce((sum, item) => item.qty + sum, 0),
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[0.65rem] font-medium tracking-[0.16em] uppercase text-muted">Fulfilment</p>
        <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight">Orders</h1>
        <p className="mt-3 max-w-xl text-muted">
          Live orders sit on the first tab. Use Completed, Cancelled, and the other status tabs to filter the same list.
        </p>
      </div>
      <AdminOrdersBoard orders={rows} initialTab={parseAdminOrderTab(query.tab)} />
    </div>
  );
}
