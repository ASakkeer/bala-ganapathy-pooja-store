import { AdminOverviewDashboard } from "@/components/admin/admin-overview-dashboard";
import { buildAdminOverview } from "@/lib/admin-overview";
import { listAdminProducts } from "@/server/admin/catalog";
import { listAdminOrders } from "@/server/admin/orders";
import { isDatabaseConfigured } from "@/server/env";

export default async function AdminHomePage() {
  const [products, orders] = await Promise.all([listAdminProducts(), listAdminOrders()]);
  const overview = buildAdminOverview(
    orders.map((order) => ({
      publicNumber: order.publicNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      grandTotalPaise: order.grandTotalPaise,
      createdAt: order.createdAt,
      phone: order.phone,
    })),
    products.map((product) => ({
      name: product.name,
      slug: product.slug,
      status: product.status,
      variants: product.variants.map((variant) => ({
        stockQty: variant.stockQty,
        isActive: variant.isActive,
      })),
    })),
  );

  return (
    <AdminOverviewDashboard
      overview={overview}
      catalogSource={isDatabaseConfigured() ? "From the database" : "Demo catalog"}
    />
  );
}
