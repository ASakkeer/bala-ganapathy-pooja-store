import "server-only";

import { desc, eq, or, asc } from "drizzle-orm";
import { normalizeIndianPhone } from "@/lib/phone";
import { getSession } from "@/server/auth";
import {
  getOrderByPublicNumber,
  listCookieOrders,
  mapDbOrder,
  type PlacedOrder,
} from "@/server/checkout";
import { getDb } from "@/server/db";
import { orderEvents, orders } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { getStoreSettings } from "@/server/queries/store";
import { isUuid } from "@/lib/cart";

export class OrderLookupError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OrderLookupError";
  }
}

function ownsOrder(order: PlacedOrder, session: { userId: string; phone: string }) {
  const orderPhone = normalizeIndianPhone(order.phone) ?? order.phone;
  const addressPhone = normalizeIndianPhone(order.address.phone) ?? order.address.phone;
  return (
    orderPhone === session.phone ||
    addressPhone === session.phone ||
    (order.userId != null && order.userId === session.userId)
  );
}

async function listDbOrdersForSession(userId: string, phone: string): Promise<PlacedOrder[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    const db = getDb();
    const rows = await db.query.orders.findMany({
      where: isUuid(userId)
        ? or(eq(orders.userId, userId), eq(orders.phone, phone))
        : eq(orders.phone, phone),
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

export async function listAccountOrders() {
  const session = await getSession();
  if (!session) {
    return [];
  }

  const fromCookie = (await listCookieOrders()).filter((order) => ownsOrder(order, session));
  const fromDb = await listDbOrdersForSession(session.userId, session.phone);
  const byNumber = new Map<string, PlacedOrder>();

  for (const order of fromDb) {
    byNumber.set(order.publicNumber, order);
  }

  for (const order of fromCookie) {
    if (!byNumber.has(order.publicNumber)) {
      byNumber.set(order.publicNumber, order);
    }
  }

  return [...byNumber.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getOwnedOrder(publicNumber: string) {
  const session = await getSession();
  const order = await getOrderByPublicNumber(publicNumber);
  if (!order) {
    return null;
  }

  if (session && ownsOrder(order, session)) {
    return order;
  }

  const cookieHit = (await listCookieOrders()).some((item) => item.publicNumber === order.publicNumber);
  if (cookieHit) {
    return order;
  }

  return null;
}

export async function trackOrderByNumberAndPhone(publicNumber: string, rawPhone: string) {
  const phone = normalizeIndianPhone(rawPhone);
  if (!phone) {
    throw new OrderLookupError("Enter a valid 10-digit Indian mobile number.", 400);
  }

  const trimmed = publicNumber.trim();
  if (!trimmed) {
    throw new OrderLookupError("Enter the order number.", 400);
  }

  const order = await getOrderByPublicNumber(trimmed);
  const orderPhone = order ? (normalizeIndianPhone(order.phone) ?? order.phone) : null;
  if (!order || orderPhone !== phone) {
    return null;
  }

  return order;
}
