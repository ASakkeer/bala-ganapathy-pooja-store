import "server-only";

import { desc, eq } from "drizzle-orm";
import { canTransitionOrder } from "@/lib/order-transitions";
import { AdminError } from "@/server/admin/catalog";
import { getSession } from "@/server/auth";
import {
  getOrderByPublicNumber,
  listCookieOrders,
  listMemoryOrders,
  saveMemoryOrder,
  type PlacedOrder,
} from "@/server/checkout";
import { getDb } from "@/server/db";
import { orderEvents, orders } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { getStoreSettings } from "@/server/queries/store";
import { isUuid } from "@/lib/cart";
import type { OrderStatus } from "@/types";

function mergeOrders(groups: PlacedOrder[][]) {
  const byNumber = new Map<string, PlacedOrder>();
  for (const group of groups) {
    for (const order of group) {
      const existing = byNumber.get(order.publicNumber);
      if (!existing || existing.createdAt < order.createdAt) {
        byNumber.set(order.publicNumber, order);
      }
    }
  }
  return [...byNumber.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function listDbOrders(): Promise<PlacedOrder[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const db = getDb();
    const rows = await db.query.orders.findMany({
      with: { items: true },
      orderBy: [desc(orders.createdAt)],
    });
    const settings = await getStoreSettings();
    const shippingLabel = settings?.shippingRules?.label ?? "Shipping";

    return rows.map((order) => ({
      id: order.id,
      publicNumber: order.publicNumber,
      userId: order.userId,
      phone: order.phone,
      address: order.addressSnapshot as PlacedOrder["address"],
      status: order.status,
      paymentStatus: order.paymentStatus,
      razorpayOrderId: order.razorpayOrderId,
      items: order.items.map((item) => ({
        name: item.nameSnapshot,
        qty: item.qty,
        pricePaise: item.pricePaise,
      })),
      subtotalPaise: order.subtotalPaise,
      shippingPaise: order.shippingPaise,
      shippingLabel,
      grandTotalPaise: order.grandTotalPaise,
      createdAt: order.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function listAdminOrders() {
  await getSession();
  return mergeOrders([listMemoryOrders(), await listCookieOrders(), await listDbOrders()]);
}

export async function getAdminOrder(publicNumber: string) {
  const decoded = decodeURIComponent(publicNumber);
  const listed = await listAdminOrders();
  return listed.find((order) => order.publicNumber === decoded) ?? getOrderByPublicNumber(decoded);
}

export async function updateAdminOrderStatus(publicNumber: string, status: OrderStatus) {
  const order = await getAdminOrder(publicNumber);
  if (!order) {
    throw new AdminError("Order not found.", 404);
  }

  if (!canTransitionOrder(order.status, status)) {
    throw new AdminError("That status change is not allowed.", 409);
  }

  const next: PlacedOrder = {
    ...order,
    status,
    paymentStatus:
      status === "payment_confirmed" || status === "processing" || status === "packed"
        ? "captured"
        : order.paymentStatus,
  };
  saveMemoryOrder(next);

  if (isDatabaseConfigured() && isUuid(order.id)) {
    try {
      const db = getDb();
      await db
        .update(orders)
        .set({
          status,
          paymentStatus: next.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
      await db.insert(orderEvents).values({
        orderId: order.id,
        status,
        note: `Admin set status to ${status}.`,
      });
    } catch {
      // Memory order still holds the new status for this process.
    }
  }

  return next;
}
