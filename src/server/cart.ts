import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cache } from "react";
import { z } from "zod";
import {
  CART_COOKIE,
  computeCartTotals,
  decodeCartCookie,
  encodeCartCookie,
  isUuid,
  lineTotalPaise,
  MAX_LINE_QTY,
  type CartCookie,
  type CartCookieItem,
} from "@/lib/cart";
import { getDb } from "@/server/db";
import { cartItems, carts } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { getVariantsByIds } from "@/server/queries/products";
import { getStoreSettings } from "@/server/queries/store";

export const CART_COOKIE_NAME = CART_COOKIE;


const cookieSchema = z.object({
  id: z.string().min(8).max(80),
  items: z.array(
    z.object({
      variantId: z.string().min(1).max(80),
      qty: z.number().int().positive().max(MAX_LINE_QTY),
    }),
  ),
});

export class CartError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CartError";
  }
}

export type CartLine = {
  variantId: string;
  qty: number;
  productName: string;
  variantName: string;
  sku: string;
  href: string;
  imageSrc?: string;
  pricePaise: number;
  mrpPaise: number | null;
  linePaise: number;
  stockQty: number;
  inStock: boolean;
};

export type CartSnapshot = {
  itemCount: number;
  items: CartLine[];
  subtotalPaise: number;
  shippingPaise: number;
  shippingLabel: string;
  grandTotalPaise: number;
  notices: string[];
};

type CookieCart = CartCookie;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  };
}

export function applyCartCookie(response: NextResponse, cart: CookieCart) {
  response.cookies.set(CART_COOKIE, encodeCartCookie(cart), cookieOptions());
  return response;
}

async function readCookie(): Promise<CookieCart | null> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  const parsed = decodeCartCookie(raw);
  if (!parsed) {
    return null;
  }

  const result = cookieSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

function emptyCart(): CookieCart {
  return { id: crypto.randomUUID(), items: [] };
}

async function loadCookieCart(): Promise<CookieCart> {
  return (await readCookie()) ?? emptyCart();
}

type VariantRecord = Awaited<ReturnType<typeof getVariantsByIds>>[number];

function toLine(variant: VariantRecord, qty: number): CartLine | null {
  const product = variant.product;

  if (!product || product.status !== "active" || !variant.isActive) {
    return null;
  }

  const stockQty = Math.max(0, variant.stockQty);
  const clamped = Math.min(qty, stockQty, MAX_LINE_QTY);

  if (clamped <= 0) {
    return null;
  }

  return {
    variantId: variant.id,
    qty: clamped,
    productName: product.name,
    variantName: variant.name,
    sku: variant.sku,
    href: `/p/${product.slug}`,
    imageSrc: product.images?.[0] || undefined,
    pricePaise: variant.pricePaise,
    mrpPaise: variant.mrpPaise,
    linePaise: lineTotalPaise(variant.pricePaise, clamped),
    stockQty,
    inStock: stockQty > 0,
  };
}

async function enrich(items: CartCookieItem[]) {
  const variants = await getVariantsByIds(items.map((item) => item.variantId));
  const byId = new Map(variants.map((variant) => [variant.id, variant]));
  const notices: string[] = [];
  const lines: CartLine[] = [];
  const nextItems: CartCookieItem[] = [];

  for (const item of items) {
    const variant = byId.get(item.variantId);

    if (!variant) {
      notices.push("An unavailable item was removed from your cart.");
      continue;
    }

    const line = toLine(variant, item.qty);

    if (!line) {
      notices.push("An out-of-stock item was removed from your cart.");
      continue;
    }

    if (line.qty !== item.qty) {
      notices.push(`${line.productName} quantity was updated to match stock.`);
    }

    lines.push(line);
    nextItems.push({ variantId: line.variantId, qty: line.qty });
  }

  return { lines, nextItems, notices };
}

async function snapshotFromItems(
  items: CartCookieItem[],
  persist: CookieCart | null,
): Promise<{ snapshot: CartSnapshot; cookie: CookieCart | null }> {
  const { lines, nextItems, notices } = await enrich(items);
  const settings = await getStoreSettings();
  const subtotalPaise = lines.reduce((sum, line) => sum + line.linePaise, 0);
  const shippingPaise =
    subtotalPaise > 0 ? (settings?.shippingRules?.flatShippingPaise ?? 0) : 0;
  const shippingLabel =
    settings?.shippingRules?.label ?? "Shipping is confirmed at checkout";
  const totals = computeCartTotals(subtotalPaise, shippingPaise);
  const cookie = persist ? { id: persist.id, items: nextItems } : null;

  if (cookie) {
    await syncDatabaseCart(cookie.id, nextItems);
  }

  return {
    cookie,
    snapshot: {
      itemCount: lines.reduce((sum, line) => sum + line.qty, 0),
      items: lines,
      ...totals,
      shippingLabel,
      notices: [...new Set(notices)],
    },
  };
}

async function syncDatabaseCart(sessionId: string, items: CartCookieItem[]) {
  if (!isDatabaseConfigured() || items.some((item) => !isUuid(item.variantId))) {
    return;
  }

  try {
    const db = getDb();
    let cart = await db.query.carts.findFirst({
      where: eq(carts.sessionId, sessionId),
    });

    if (!cart) {
      const [created] = await db.insert(carts).values({ sessionId }).returning();
      cart = created;
    }

    if (!cart) {
      return;
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    if (items.length > 0) {
      await db.insert(cartItems).values(
        items.map((item) => ({
          cartId: cart.id,
          variantId: item.variantId,
          qty: item.qty,
        })),
      );
    }

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));
  } catch {
    // Cookie remains the guest cart when Postgres is unreachable.
  }
}

async function readDatabaseItems(sessionId: string): Promise<CartCookieItem[] | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const cart = await db.query.carts.findFirst({
      where: eq(carts.sessionId, sessionId),
      with: { items: true },
    });

    if (!cart) {
      return null;
    }

    return cart.items.map((item) => ({
      variantId: item.variantId,
      qty: item.qty,
    }));
  } catch {
    return null;
  }
}

export const getCart = cache(async (): Promise<CartSnapshot> => {
  const cookieCart = await readCookie();

  if (!cookieCart) {
    const settings = await getStoreSettings();
    return {
      itemCount: 0,
      items: [],
      subtotalPaise: 0,
      shippingPaise: 0,
      shippingLabel: settings?.shippingRules?.label ?? "Shipping is confirmed at checkout",
      grandTotalPaise: 0,
      notices: [],
    };
  }

  const dbItems = await readDatabaseItems(cookieCart.id);
  const items = dbItems ?? cookieCart.items;
  const { snapshot } = await snapshotFromItems(items, null);
  return snapshot;
});

export async function addCartItem(variantId: string, qty: number) {
  if (!Number.isInteger(qty) || qty < 1) {
    throw new CartError("Quantity must be at least 1.", 400);
  }

  const cookieCart = await loadCookieCart();
  const dbItems = await readDatabaseItems(cookieCart.id);
  const current = dbItems ?? cookieCart.items;
  const existing = current.find((item) => item.variantId === variantId);
  const nextQty = (existing?.qty ?? 0) + qty;
  const [variant] = await getVariantsByIds([variantId]);

  if (!variant || variant.product?.status !== "active" || !variant.isActive) {
    throw new CartError("That product is not available.", 404);
  }

  if (variant.stockQty <= 0) {
    throw new CartError("That pack is out of stock.", 409);
  }

  if (nextQty > variant.stockQty) {
    throw new CartError(`Only ${variant.stockQty} left in stock.`, 409);
  }

  if (nextQty > MAX_LINE_QTY) {
    throw new CartError(`You can add at most ${MAX_LINE_QTY} of this pack.`, 409);
  }

  const items = existing
    ? current.map((item) =>
        item.variantId === variantId ? { ...item, qty: nextQty } : item,
      )
    : [...current, { variantId, qty: nextQty }];

  return snapshotFromItems(items, { id: cookieCart.id, items });
}

export async function setCartItemQty(variantId: string, qty: number) {
  if (!Number.isInteger(qty) || qty < 0) {
    throw new CartError("Quantity is invalid.", 400);
  }

  if (qty === 0) {
    return removeCartItem(variantId);
  }

  const cookieCart = await loadCookieCart();
  const dbItems = await readDatabaseItems(cookieCart.id);
  const current = dbItems ?? cookieCart.items;
  const [variant] = await getVariantsByIds([variantId]);

  if (!variant || !current.some((item) => item.variantId === variantId)) {
    throw new CartError("That item is not in your cart.", 404);
  }

  if (qty > variant.stockQty) {
    throw new CartError(`Only ${variant.stockQty} left in stock.`, 409);
  }

  const items = current.map((item) =>
    item.variantId === variantId ? { ...item, qty } : item,
  );

  return snapshotFromItems(items, { id: cookieCart.id, items });
}

export async function removeCartItem(variantId: string) {
  const cookieCart = await loadCookieCart();
  const dbItems = await readDatabaseItems(cookieCart.id);
  const current = dbItems ?? cookieCart.items;
  const items = current.filter((item) => item.variantId !== variantId);

  return snapshotFromItems(items, { id: cookieCart.id, items });
}

export async function clearCart() {
  const cookieCart = await loadCookieCart();
  return snapshotFromItems([], { id: cookieCart.id, items: [] });
}

export const cartItemBodySchema = z.object({
  variantId: z.string().min(1).max(80),
  qty: z.number().int().min(0).max(MAX_LINE_QTY).optional(),
});

export async function mergeGuestCartForUser(userId: string) {
  const cookieCart = await readCookie();

  if (!cookieCart || !isDatabaseConfigured()) {
    return;
  }

  try {
    const db = getDb();
    await syncDatabaseCart(cookieCart.id, cookieCart.items);
    const cart = await db.query.carts.findFirst({
      where: eq(carts.sessionId, cookieCart.id),
    });

    if (cart && !cart.userId) {
      await db.update(carts).set({ userId }).where(eq(carts.id, cart.id));
    }
  } catch {
    // Guest cookie cart still works if Postgres merge fails.
  }
}
