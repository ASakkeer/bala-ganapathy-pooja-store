import { asc, desc, eq, sql } from "drizzle-orm";
import { isUuid } from "@/lib/cart";
import { isFresherOrder } from "@/lib/order-freshness";
import { parseCancelReason } from "@/lib/order-status";
import { parseShippedDateInput } from "@/lib/shipped-date";
import {
  inferDeliveryMethod,
  isShopDelivery,
  parseCourierName,
  parseDeliveryMethod,
  parseTrackingId,
  parseTrackingLocation,
  parseTrackingUrl,
  SHOP_DELIVERY_LABEL,
  type DeliveryMethod,
} from "@/lib/order-tracking";
import { canTransitionOrder } from "@/lib/order-transitions";
import { AdminError } from "@/server/admin/catalog";
import { revalidateCatalog, revalidateOrder } from "@/server/admin/revalidate";
import { getSession } from "@/server/auth";
import {
  getOrderByPublicNumber,
  listCookieOrders,
  listMemoryOrders,
  mapDbOrder,
  saveMemoryOrder,
  type PlacedOrder,
} from "@/server/checkout";
import { getDb } from "@/server/db";
import { orderEvents, orderItems, orders, payments, variants } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { getStoreSettings } from "@/server/queries/store";
import type { OrderStatus, PaymentStatus } from "@/types";

export type AdminOrderStatusInput = {
  status: OrderStatus;
  shippedAt?: string;
  cancelReason?: string;
  deliveryMethod?: DeliveryMethod | "";
  courierName?: string;
  trackingId?: string;
  trackingUrl?: string;
  trackingLocation?: string;
};

function mergeOrders(groups: PlacedOrder[][]) {
  const byNumber = new Map<string, PlacedOrder>();
  for (const group of groups) {
    for (const order of group) {
      const existing = byNumber.get(order.publicNumber);
      if (!existing || isFresherOrder(order, existing)) {
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
      with: {
        items: true,
        events: {
          orderBy: [asc(orderEvents.at)],
        },
      },
      orderBy: [desc(orders.createdAt)],
    });
    const settings = await getStoreSettings();
    const shippingLabel = settings?.shippingRules?.label ?? "Shipping";
    return rows.map((order) => mapDbOrder(order, shippingLabel));
  } catch {
    return [];
  }
}

export async function listAdminOrders() {
  await getSession();
  return mergeOrders([await listDbOrders(), listMemoryOrders(), await listCookieOrders()]);
}

export async function getAdminOrder(publicNumber: string) {
  const decoded = decodeURIComponent(publicNumber);
  return (
    (await getOrderByPublicNumber(decoded)) ??
    (await listAdminOrders()).find((order) => order.publicNumber === decoded) ??
    null
  );
}

function eventNote(
  status: OrderStatus,
  cancelReason: string | null,
  shippedAt: Date | null,
  courierName: string | null,
  trackingId: string | null,
  trackingLocation: string | null,
) {
  if (status === "cancelled" && cancelReason) {
    return cancelReason;
  }
  if (status === "shipped") {
    const parts = [
      shippedAt ? `Shipped on ${shippedAt.toISOString().slice(0, 10)}` : "Shipped",
      trackingId ? `tracking ${trackingId}` : isShopDelivery(courierName) ? "shop delivery" : null,
    ].filter(Boolean);
    return `${parts.join(", ")}.`;
  }
  if (status === "out_for_delivery") {
    return trackingLocation ? `Out for delivery. ${trackingLocation}` : "Out for delivery.";
  }
  if (status === "delivered") {
    return trackingLocation ? `Delivered. ${trackingLocation}` : "Delivered.";
  }
  return null;
}

function resolveDelivery(
  order: PlacedOrder,
  input: AdminOrderStatusInput,
) {
  const inferred = inferDeliveryMethod(
    order.courierName,
    order.trackingId,
    order.trackingUrl,
    order.status,
  );
  const parsedMethod = parseDeliveryMethod(input.deliveryMethod || inferred);
  if (parsedMethod.error || !parsedMethod.value) {
    throw new AdminError(parsedMethod.error ?? "Choose how this order will be delivered.", 400);
  }

  const location = parseTrackingLocation(input.trackingLocation ?? "");
  if (location.error) {
    throw new AdminError(location.error, 400);
  }

  if (parsedMethod.value === "store") {
    return {
      courierName: SHOP_DELIVERY_LABEL,
      trackingId: null,
      trackingUrl: null,
      trackingLocation: location.value,
    };
  }

  const courier = parseCourierName(input.courierName ?? "");
  if (courier.error) {
    throw new AdminError(courier.error, 400);
  }
  const trackingId = parseTrackingId(input.trackingId ?? "", false);
  if (trackingId.error) {
    throw new AdminError(trackingId.error, 400);
  }
  const trackingUrl = parseTrackingUrl(input.trackingUrl ?? "");
  if (trackingUrl.error) {
    throw new AdminError(trackingUrl.error, 400);
  }
  return {
    courierName: courier.value,
    trackingId: trackingId.value,
    trackingUrl: trackingUrl.value,
    trackingLocation: location.value,
  };
}

function nextPaymentStatus(order: PlacedOrder, status: OrderStatus): PaymentStatus {
  if (status === "cancelled" && (order.paymentStatus === "captured" || order.paymentStatus === "refunded")) {
    return "refunded";
  }
  if (status === "payment_confirmed" || status === "processing" || status === "packed") {
    return "captured";
  }
  return order.paymentStatus;
}

async function restoreCancelledStock(
  db: ReturnType<typeof getDb>,
  orderId: string,
) {
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (!item.variantId || !isUuid(item.variantId)) {
      continue;
    }
    await db
      .update(variants)
      .set({ stockQty: sql`${variants.stockQty} + ${item.qty}` })
      .where(eq(variants.id, item.variantId));
  }
}

export async function updateAdminOrderStatus(publicNumber: string, input: AdminOrderStatusInput) {
  const order = await getAdminOrder(publicNumber);
  if (!order) {
    throw new AdminError("Order not found.", 404);
  }

  const status = input.status;
  const trackingOnly = status === order.status;
  if (!trackingOnly && !canTransitionOrder(order.status, status)) {
    throw new AdminError("That status change is not allowed.", 409);
  }
  if (
    trackingOnly &&
    status !== "shipped" &&
    status !== "out_for_delivery" &&
    status !== "delivered"
  ) {
    throw new AdminError("That status change is not allowed.", 409);
  }

  let shippedAt: Date | null = order.shippedAt ? new Date(order.shippedAt) : null;
  let cancelReason = order.cancelReason ?? null;
  const needsDelivery =
    status === "shipped" || status === "out_for_delivery" || status === "delivered";
  const tracking = needsDelivery
    ? resolveDelivery(order, input)
    : {
        courierName: order.courierName ?? null,
        trackingId: order.trackingId ?? null,
        trackingUrl: order.trackingUrl ?? null,
        trackingLocation: order.trackingLocation ?? null,
      };

  if (status === "shipped" && !trackingOnly) {
    const parsed = parseShippedDateInput(input.shippedAt ?? "", order.createdAt);
    if (parsed.error || !parsed.at) {
      throw new AdminError(parsed.error ?? "Choose the shipped date.", 400);
    }
    shippedAt = parsed.at;
  }

  if (status === "cancelled") {
    const parsed = parseCancelReason(input.cancelReason ?? "");
    if (parsed.error || !parsed.reason) {
      throw new AdminError(parsed.error ?? "Enter a cancellation reason.", 400);
    }
    cancelReason = parsed.reason;
  }

  const paymentStatus = trackingOnly ? order.paymentStatus : nextPaymentStatus(order, status);
  const eventAt = status === "shipped" && shippedAt ? shippedAt : new Date();
  const note = eventNote(
    status,
    cancelReason,
    shippedAt,
    tracking.courierName,
    tracking.trackingId,
    tracking.trackingLocation,
  );
  const next: PlacedOrder = {
    ...order,
    status,
    paymentStatus,
    shippedAt: shippedAt ? shippedAt.toISOString() : order.shippedAt ?? null,
    cancelReason,
    courierName: tracking.courierName,
    trackingId: tracking.trackingId,
    trackingUrl: tracking.trackingUrl,
    trackingLocation: tracking.trackingLocation,
    events: trackingOnly
      ? order.events
      : [
          ...(order.events ?? []),
          {
            status,
            at: eventAt.toISOString(),
            note,
          },
        ],
  };

  if (isDatabaseConfigured()) {
    if (!isUuid(order.id)) {
      throw new AdminError("This order is not saved in the database yet.", 409);
    }

    try {
      const db = getDb();
      await db.transaction(async (tx) => {
        await tx
          .update(orders)
          .set({
            status,
            paymentStatus,
            shippedAt,
            cancelReason,
            courierName: tracking.courierName,
            trackingId: tracking.trackingId,
            trackingUrl: tracking.trackingUrl,
            trackingLocation: tracking.trackingLocation,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        if (!trackingOnly) {
          await tx.insert(orderEvents).values({
            orderId: order.id,
            status,
            at: eventAt,
            note,
          });
          if (paymentStatus === "refunded") {
            await tx.update(payments).set({ status: "refunded" }).where(eq(payments.orderId, order.id));
          }
          if (status === "cancelled") {
            await restoreCancelledStock(tx as unknown as ReturnType<typeof getDb>, order.id);
          }
        }
      });
    } catch (error) {
      if (error instanceof AdminError) {
        throw error;
      }
      console.error("[admin] order status update failed", error);
      throw new AdminError("Could not save the order status.", 500);
    }
  }

  saveMemoryOrder(next);
  revalidateOrder(order.publicNumber);
  if (status === "cancelled" && !trackingOnly) {
    revalidateCatalog();
  }
  return next;
}
