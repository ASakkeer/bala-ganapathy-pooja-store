import "server-only";

import { eq } from "drizzle-orm";
import { computeCartTotals } from "@/lib/cart";
import { normalizeIndianPhone } from "@/lib/phone";
import { isUuid } from "@/lib/cart";
import { applyCartCookie, clearCart, getCart, type CartLine } from "@/server/cart";
import { getSession } from "@/server/auth";
import { getOwnedAddress, setDefaultAddress } from "@/server/addresses";
import { getDb } from "@/server/db";
import {
  orderEvents,
  orderItems,
  orders,
  payments,
  variants,
} from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { orderStatusRank } from "@/lib/order-status";
import type { OrderStatus, PaymentStatus } from "@/types";
import { mockReserveStock } from "@/server/queries/mock-catalog";
import { getServiceablePincode } from "@/server/queries/pincodes";
import { getStoreSettings } from "@/server/queries/store";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  MAX_STORED_ORDERS,
  ORDER_COOKIE,
  decodeOrderCookie,
  encodeOrderCookie,
  type OrderCookie,
} from "@/lib/order-cookie";

export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

export const checkoutBodySchema = z.object({
  addressId: z.string().trim().min(1),
});

export type AddressSnapshot = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type PlacedOrder = {
  id: string;
  publicNumber: string;
  userId?: string | null;
  phone: string;
  address: AddressSnapshot;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  items: Array<{
    name: string;
    qty: number;
    pricePaise: number;
  }>;
  subtotalPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  grandTotalPaise: number;
  createdAt: string;
};

const memoryOrders = new Map<string, PlacedOrder>();

function publicNumber() {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `BG-${stamp}-${rand}`;
}

function lineName(item: CartLine) {
  return `${item.productName} · ${item.variantName}`;
}

function mapDbOrder(
  order: {
    id: string;
    publicNumber: string;
    userId: string | null;
    phone: string;
    addressSnapshot: unknown;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    razorpayOrderId: string | null;
    subtotalPaise: number;
    shippingPaise: number;
    grandTotalPaise: number;
    createdAt: Date;
    items: Array<{ nameSnapshot: string; qty: number; pricePaise: number }>;
  },
  shippingLabel: string,
): PlacedOrder {
  return {
    id: order.id,
    publicNumber: order.publicNumber,
    userId: order.userId,
    phone: order.phone,
    address: order.addressSnapshot as AddressSnapshot,
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
  };
}

export function saveMemoryOrder(order: PlacedOrder) {
  memoryOrders.set(order.publicNumber, order);
}

export function listMemoryOrders(): PlacedOrder[] {
  return [...memoryOrders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  };
}

export function applyOrderCookie(response: NextResponse, book: OrderCookie) {
  response.cookies.set(ORDER_COOKIE, encodeOrderCookie(book), cookieOptions());
  return response;
}

async function readOrderCookieBook(): Promise<OrderCookie | null> {
  const raw = (await cookies()).get(ORDER_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  return decodeOrderCookie(raw);
}

export async function listCookieOrders(): Promise<PlacedOrder[]> {
  const book = await readOrderCookieBook();
  return (book?.orders ?? []) as PlacedOrder[];
}

export async function upsertOrderCookie(order: PlacedOrder): Promise<OrderCookie> {
  const session = await getSession();
  const userId = session?.userId ?? order.userId ?? "guest";
  const current = await readOrderCookieBook();
  const existing = current?.orders ?? [];
  const stored = [
    order,
    ...existing.filter((item) => item.publicNumber !== order.publicNumber),
  ].slice(0, MAX_STORED_ORDERS);

  return { userId, orders: stored };
}

export function getMemoryOrderByRazorpayOrderId(razorpayOrderId: string) {
  for (const order of memoryOrders.values()) {
    if (order.razorpayOrderId === razorpayOrderId) {
      return order;
    }
  }

  return null;
}

function isFresherOrder(candidate: PlacedOrder, current: PlacedOrder) {
  const candidateRank = orderStatusRank(candidate.status);
  const currentRank = orderStatusRank(current.status);
  if (candidateRank !== currentRank) {
    return candidateRank > currentRank;
  }

  if (candidate.paymentStatus === "captured" && current.paymentStatus !== "captured") {
    return true;
  }

  if (candidate.razorpayOrderId && !current.razorpayOrderId) {
    return true;
  }

  return false;
}

function mergeOrderSnapshots(
  primary: PlacedOrder | null | undefined,
  secondary: PlacedOrder | null | undefined,
) {
  if (!primary) {
    return secondary ?? null;
  }

  if (!secondary) {
    return primary;
  }

  return isFresherOrder(secondary, primary) ? secondary : primary;
}

function snapshotLooksUnpaid(order: PlacedOrder) {
  return (
    (order.status === "pending_payment" ||
      order.status === "placed" ||
      order.status === "payment_failed") &&
    (order.paymentStatus === "pending" || order.paymentStatus === "failed")
  );
}

async function loadDbOrderByPublicNumber(publicNumber: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const order = await db.query.orders.findFirst({
      where: eq(orders.publicNumber, publicNumber),
      with: { items: true },
    });

    if (!order) {
      return null;
    }

    const settings = await getStoreSettings();
    return mapDbOrder(order, settings?.shippingRules?.label ?? "Shipping");
  } catch {
    return null;
  }
}

export async function getOrderByPublicNumber(number: string) {
  let decoded = number.trim();
  try {
    decoded = decodeURIComponent(number).trim();
  } catch {
    decoded = number.trim();
  }
  const fromMemory = memoryOrders.get(decoded) ?? memoryOrders.get(number) ?? null;
  const book = await readOrderCookieBook();
  const fromCookie =
    (book?.orders.find(
      (item) => item.publicNumber === decoded || item.publicNumber === number,
    ) as PlacedOrder | undefined) ?? null;

  let order = mergeOrderSnapshots(fromMemory, fromCookie);

  if (!order || snapshotLooksUnpaid(order)) {
    const fromDb =
      (await loadDbOrderByPublicNumber(decoded)) ??
      (decoded === number ? null : await loadDbOrderByPublicNumber(number));
    order = mergeOrderSnapshots(order, fromDb);
  }

  if (order) {
    saveMemoryOrder(order);
  }

  return order;
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string) {
  const fromMemory = getMemoryOrderByRazorpayOrderId(razorpayOrderId);
  if (fromMemory) {
    return fromMemory;
  }

  const book = await readOrderCookieBook();
  const fromCookie = book?.orders.find((item) => item.razorpayOrderId === razorpayOrderId);
  if (fromCookie) {
    const order = fromCookie as PlacedOrder;
    saveMemoryOrder(order);
    return order;
  }

  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const order = await db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, razorpayOrderId),
      with: { items: true },
    });

    if (!order) {
      return null;
    }

    const settings = await getStoreSettings();
    const mapped = mapDbOrder(order, settings?.shippingRules?.label ?? "Shipping");
    saveMemoryOrder(mapped);
    return mapped;
  } catch {
    return null;
  }
}

export function orderIsPayable(order: PlacedOrder) {
  return (
    (order.status === "pending_payment" || order.status === "payment_failed") &&
    (order.paymentStatus === "pending" || order.paymentStatus === "failed")
  );
}

export async function setOrderRazorpayOrderId(publicNumber: string, razorpayOrderId: string) {
  const order = await getOrderByPublicNumber(publicNumber);
  if (!order) {
    return null;
  }

  const next: PlacedOrder = {
    ...order,
    razorpayOrderId,
    status: order.status === "payment_failed" ? "pending_payment" : order.status,
    paymentStatus: order.paymentStatus === "failed" ? "pending" : order.paymentStatus,
  };
  saveMemoryOrder(next);

  if (isDatabaseConfigured() && isUuid(order.id)) {
    try {
      const db = getDb();
      await db
        .update(orders)
        .set({
          razorpayOrderId,
          status: next.status,
          paymentStatus: next.paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));
    } catch {
      // Memory order still holds the Razorpay id for this process.
    }
  }

  return next;
}

export async function applyOrderPayment(input: {
  publicNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  method?: string | null;
  eventNote: string;
  rawPayload?: unknown;
}) {
  const order = await getOrderByPublicNumber(input.publicNumber);
  if (!order) {
    return null;
  }

  if (order.status === "processing") {
    return order;
  }

  if (order.status === input.status && order.paymentStatus === input.paymentStatus) {
    return order;
  }

  const next: PlacedOrder = {
    ...order,
    status: input.status,
    paymentStatus: input.paymentStatus,
    razorpayOrderId: input.razorpayOrderId ?? order.razorpayOrderId,
  };
  saveMemoryOrder(next);

  if (isDatabaseConfigured() && isUuid(order.id)) {
    try {
      const db = getDb();
      await db
        .update(orders)
        .set({
          status: next.status,
          paymentStatus: next.paymentStatus,
          razorpayOrderId: next.razorpayOrderId,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      if (input.razorpayPaymentId) {
        const existing = await db.query.payments.findFirst({
          where: eq(payments.razorpayPaymentId, input.razorpayPaymentId),
        });

        if (!existing) {
          await db.insert(payments).values({
            orderId: order.id,
            razorpayPaymentId: input.razorpayPaymentId,
            method: input.method ?? null,
            amountPaise: order.grandTotalPaise,
            status: input.paymentStatus,
            rawPayload: input.rawPayload ?? null,
          });
        }
      }

      await db.insert(orderEvents).values({
        orderId: order.id,
        status: input.status,
        note: input.eventNote,
      });
    } catch {
      // Memory order is still updated for the confirmation page.
    }
  }

  return next;
}

async function reserveStock(items: CartLine[]) {
  if (!isDatabaseConfigured()) {
    for (const item of items) {
      if (!mockReserveStock(item.variantId, item.qty)) {
        throw new CheckoutError(
          `Stock changed for ${item.productName}. Update your cart and try again.`,
          409,
        );
      }
    }
    return;
  }

  try {
    const db = getDb();

    for (const item of items) {
      if (!isUuid(item.variantId)) {
        if (!mockReserveStock(item.variantId, item.qty)) {
          throw new CheckoutError(
            `Stock changed for ${item.productName}. Update your cart and try again.`,
            409,
          );
        }
        continue;
      }

      const [row] = await db
        .select()
        .from(variants)
        .where(eq(variants.id, item.variantId))
        .limit(1);

      if (!row || row.stockQty < item.qty) {
        throw new CheckoutError(
          `Stock changed for ${item.productName}. Update your cart and try again.`,
          409,
        );
      }

      await db
        .update(variants)
        .set({ stockQty: row.stockQty - item.qty })
        .where(eq(variants.id, item.variantId));
    }
  } catch (error) {
    if (error instanceof CheckoutError) {
      throw error;
    }

    for (const item of items) {
      if (!mockReserveStock(item.variantId, item.qty)) {
        throw new CheckoutError(
          `Stock changed for ${item.productName}. Update your cart and try again.`,
          409,
        );
      }
    }
  }
}

export async function placeOrder(input: z.infer<typeof checkoutBodySchema>) {
  const session = await getSession();
  if (!session) {
    throw new CheckoutError("Please sign in to continue.", 401);
  }

  const saved = await getOwnedAddress(input.addressId);
  if (!saved) {
    throw new CheckoutError("Select a delivery address.", 400);
  }

  const phone = normalizeIndianPhone(saved.phone);
  if (!phone) {
    throw new CheckoutError("That address has an invalid mobile number.", 400);
  }

  const pincode = await getServiceablePincode(saved.pincode);
  if (!pincode) {
    throw new CheckoutError(
      "We don’t deliver to this pincode yet. Choose another address or add one with 110001, 400001, or 560001 in the demo.",
      400,
    );
  }

  await setDefaultAddress(saved.id);

  const cart = await getCart();
  if (cart.items.length === 0) {
    throw new CheckoutError("Your cart is empty.", 400);
  }

  for (const item of cart.items) {
    if (item.qty > item.stockQty) {
      throw new CheckoutError(
        `Stock changed for ${item.productName}. Update your cart and try again.`,
        409,
      );
    }
  }

  await reserveStock(cart.items);

  const settings = await getStoreSettings();
  const totals = computeCartTotals(cart.subtotalPaise, cart.shippingPaise);
  const address: AddressSnapshot = {
    name: saved.name,
    phone,
    line1: saved.line1,
    line2: saved.line2 || undefined,
    city: saved.city,
    state: saved.state,
    pincode: saved.pincode,
  };
  const number = publicNumber();
  const userId = session && isUuid(session.userId) ? session.userId : null;

  const placed: PlacedOrder = {
    id: crypto.randomUUID(),
    publicNumber: number,
    userId,
    phone,
    address,
    status: "pending_payment",
    paymentStatus: "pending",
    razorpayOrderId: null,
    items: cart.items.map((item) => ({
      name: lineName(item),
      qty: item.qty,
      pricePaise: item.linePaise,
    })),
    subtotalPaise: totals.subtotalPaise,
    shippingPaise: totals.shippingPaise,
    shippingLabel: settings?.shippingRules?.label ?? "Shipping is confirmed at checkout",
    grandTotalPaise: totals.grandTotalPaise,
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const [order] = await db
        .insert(orders)
        .values({
          publicNumber: number,
          userId,
          phone,
          addressSnapshot: address,
          status: "pending_payment",
          paymentStatus: "pending",
          subtotalPaise: totals.subtotalPaise,
          shippingPaise: totals.shippingPaise,
          grandTotalPaise: totals.grandTotalPaise,
        })
        .returning();

      placed.id = order.id;

      await db.insert(orderItems).values(
        cart.items.map((item) => ({
          orderId: order.id,
          variantId: isUuid(item.variantId) ? item.variantId : null,
          nameSnapshot: lineName(item),
          qty: item.qty,
          pricePaise: item.pricePaise,
        })),
      );

      await db.insert(orderEvents).values({
        orderId: order.id,
        status: "pending_payment",
        note: "Order created, waiting for payment.",
      });
    } catch {
      // Memory order still lets the demo confirmation page work.
    }
  }

  saveMemoryOrder(placed);
  const cleared = await clearCart();

  return { order: placed, cart: cleared };
}

export async function checkoutResponse(
  result: Awaited<ReturnType<typeof placeOrder>>,
) {
  const response = NextResponse.json({
    ok: true,
    publicNumber: result.order.publicNumber,
  });
  if (result.cart.cookie) {
    applyCartCookie(response, result.cart.cookie);
  }
  applyOrderCookie(response, await upsertOrderCookie(result.order));
  return response;
}
