import { calendarDateInKolkata } from "@/lib/shipped-date";
import { orderStatusLabel } from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";

export type OverviewOrder = {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  grandTotalPaise: number;
  createdAt: string;
  phone: string;
};

export type OverviewProduct = {
  name: string;
  slug: string;
  status: "draft" | "active" | "archived";
  variants: Array<{ stockQty: number; isActive: boolean }>;
};

const OPEN_STATUSES: OrderStatus[] = [
  "pending_payment",
  "placed",
  "payment_confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
];

const STATUS_CHART: OrderStatus[] = [
  "pending_payment",
  "placed",
  "payment_confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "payment_failed",
];

function isNetPaid(order: OverviewOrder) {
  return order.paymentStatus === "captured" && order.status !== "cancelled";
}

function productStock(product: OverviewProduct) {
  return product.variants
    .filter((variant) => variant.isActive)
    .reduce((sum, variant) => sum + Math.max(0, variant.stockQty), 0);
}

function shiftKolkataDate(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

export function buildAdminOverview(orders: OverviewOrder[], products: OverviewProduct[], now = new Date()) {
  const today = calendarDateInKolkata(now);
  const dayKeys = Array.from({ length: 14 }, (_, index) => shiftKolkataDate(today, index - 13));
  const revenueByDay = new Map(dayKeys.map((day) => [day, 0]));
  const ordersByDay = new Map(dayKeys.map((day) => [day, 0]));
  const statusCounts = new Map<OrderStatus, number>();

  let revenuePaise = 0;
  let refundedPaise = 0;
  let paidOrders = 0;
  let pendingPayment = 0;
  let openOrders = 0;
  let delivered = 0;
  let cancelled = 0;

  for (const order of orders) {
    statusCounts.set(order.status, (statusCounts.get(order.status) ?? 0) + 1);
    const day = calendarDateInKolkata(order.createdAt);
    if (ordersByDay.has(day)) {
      ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
    }

    if (isNetPaid(order)) {
      revenuePaise += order.grandTotalPaise;
      paidOrders += 1;
      if (revenueByDay.has(day)) {
        revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + order.grandTotalPaise);
      }
    }
    if (order.paymentStatus === "refunded") {
      refundedPaise += order.grandTotalPaise;
    }
    if (order.status === "pending_payment" || order.status === "placed" || order.paymentStatus === "pending") {
      if (order.status !== "cancelled" && order.status !== "payment_failed") {
        pendingPayment += 1;
      }
    }
    if (OPEN_STATUSES.includes(order.status)) {
      openOrders += 1;
    }
    if (order.status === "delivered") {
      delivered += 1;
    }
    if (order.status === "cancelled") {
      cancelled += 1;
    }
  }

  const activeProducts = products.filter((product) => product.status === "active");
  const lowStock = activeProducts.filter((product) => {
    const stock = productStock(product);
    return stock > 0 && stock <= 5;
  });
  const outOfStock = activeProducts.filter((product) => productStock(product) <= 0);

  const statusBars = STATUS_CHART.map((status) => ({
    status,
    label: orderStatusLabel(status),
    count: statusCounts.get(status) ?? 0,
  })).filter((item) => item.count > 0);

  const recent = [...orders]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 6);

  return {
    totals: {
      revenuePaise,
      refundedPaise,
      orders: orders.length,
      paidOrders,
      pendingPayment,
      openOrders,
      delivered,
      cancelled,
      activeProducts: activeProducts.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
    },
    statusBars,
    revenueSeries: dayKeys.map((day) => ({
      day,
      label: day.slice(8),
      revenuePaise: revenueByDay.get(day) ?? 0,
      orders: ordersByDay.get(day) ?? 0,
    })),
    recent,
    attention: {
      lowStock: lowStock.slice(0, 5).map((product) => ({
        name: product.name,
        slug: product.slug,
        stock: productStock(product),
      })),
      outOfStock: outOfStock.slice(0, 5).map((product) => ({
        name: product.name,
        slug: product.slug,
      })),
    },
  };
}

export type AdminOverview = ReturnType<typeof buildAdminOverview>;
