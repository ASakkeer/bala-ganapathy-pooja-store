import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ADDRESS_COOKIE,
  decodeAddressCookie,
  encodeAddressCookie,
  MAX_SAVED_ADDRESSES,
  type AddressCookie,
  type AddressCookieItem,
} from "@/lib/addresses";
import { isUuid } from "@/lib/cart";
import { normalizeIndianPhone } from "@/lib/phone";
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { addresses } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";
import { getServiceablePincode } from "@/server/queries/pincodes";
import type { Address } from "@/types";

export class AddressError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AddressError";
  }
}

export const addressBodySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(10).max(15),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().regex(/^\d{6}$/),
  isDefault: z.boolean().optional(),
});

export type AddressMutation = {
  items: Address[];
  address?: Address;
  book: AddressCookie;
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  };
}

export function applyAddressCookie(response: NextResponse, book: AddressCookie) {
  response.cookies.set(ADDRESS_COOKIE, encodeAddressCookie(book), cookieOptions());
  return response;
}

function toAddress(item: AddressCookieItem, userId: string): Address {
  return {
    id: item.id,
    userId,
    guestKey: null,
    name: item.name,
    phone: item.phone,
    line1: item.line1,
    line2: item.line2 ?? null,
    city: item.city,
    state: item.state,
    pincode: item.pincode,
    isDefault: item.isDefault,
  };
}

function toCookieItem(address: Address): AddressCookieItem {
  return {
    id: address.id,
    name: address.name,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    isDefault: address.isDefault,
  };
}

function ensureDefault(items: Address[]): Address[] {
  if (items.length === 0) {
    return items;
  }

  if (items.length === 1) {
    return [{ ...items[0], isDefault: true }];
  }

  const defaultCount = items.filter((item) => item.isDefault).length;
  if (defaultCount === 1) {
    return items;
  }

  return items.map((item, index) => ({ ...item, isDefault: index === 0 }));
}

function sortAddresses(items: Address[]) {
  return [...items].sort((left, right) => Number(right.isDefault) - Number(left.isDefault));
}

function bookFrom(userId: string, items: Address[]): AddressCookie {
  const normalized = ensureDefault(items);
  return {
    userId,
    items: normalized.map(toCookieItem),
  };
}

async function readCookieBook(userId: string): Promise<Address[]> {
  const raw = (await cookies()).get(ADDRESS_COOKIE)?.value;
  if (!raw) {
    return [];
  }

  const parsed = decodeAddressCookie(raw);
  if (!parsed || parsed.userId !== userId || !Array.isArray(parsed.items)) {
    return [];
  }

  return parsed.items.map((item) => toAddress(item, userId));
}

function mapRow(row: {
  id: string;
  userId: string | null;
  guestKey: string | null;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}): Address {
  return {
    id: row.id,
    userId: row.userId,
    guestKey: row.guestKey,
    name: row.name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    isDefault: row.isDefault,
  };
}

async function canUseDatabase(userId: string) {
  return isDatabaseConfigured() && isUuid(userId);
}

async function readDbAddresses(userId: string): Promise<Address[]> {
  if (!(await canUseDatabase(userId))) {
    return [];
  }

  try {
    const db = getDb();
    const rows = await db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
      orderBy: [desc(addresses.isDefault), desc(addresses.createdAt)],
    });
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function listAddresses() {
  const session = await requireSession();
  const fromCookie = await readCookieBook(session.userId);
  const fromDb = await readDbAddresses(session.userId);
  const merged = fromDb.length > 0 ? fromDb : fromCookie;
  return sortAddresses(ensureDefault(merged));
}

export async function getOwnedAddress(addressId: string) {
  const items = await listAddresses();
  return items.find((item) => item.id === addressId) ?? null;
}

async function persistDb(userId: string, items: Address[]) {
  if (!(await canUseDatabase(userId))) {
    return;
  }

  try {
    const db = getDb();
    const existing = await db.query.addresses.findMany({
      where: eq(addresses.userId, userId),
    });
    const existingIds = new Set(existing.map((row) => row.id));
    const nextIds = new Set(items.map((item) => item.id));

    for (const row of existing) {
      if (!nextIds.has(row.id)) {
        await db.delete(addresses).where(and(eq(addresses.id, row.id), eq(addresses.userId, userId)));
      }
    }

    for (const item of items) {
      if (existingIds.has(item.id)) {
        await db
          .update(addresses)
          .set({
            name: item.name,
            phone: item.phone,
            line1: item.line1,
            line2: item.line2,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
            isDefault: item.isDefault,
          })
          .where(eq(addresses.id, item.id));
      } else {
        await db.insert(addresses).values({
          id: item.id,
          userId,
          name: item.name,
          phone: item.phone,
          line1: item.line1,
          line2: item.line2,
          city: item.city,
          state: item.state,
          pincode: item.pincode,
          isDefault: item.isDefault,
        });
      }
    }
  } catch {
    // Cookie remains the checkout source of truth.
  }
}

export async function createAddress(input: z.infer<typeof addressBodySchema>): Promise<AddressMutation> {
  const session = await requireSession();
  const phone = normalizeIndianPhone(input.phone);
  if (!phone) {
    throw new AddressError("Enter a valid 10-digit Indian mobile number.", 400);
  }

  const pincode = await getServiceablePincode(input.pincode);
  if (!pincode) {
    throw new AddressError(
      "We don’t deliver to this pincode yet. Try 110001, 400001, or 560001 in the demo.",
      400,
    );
  }

  const existing = await listAddresses();
  if (existing.length >= MAX_SAVED_ADDRESSES) {
    throw new AddressError("You already have the maximum number of saved addresses.", 400);
  }

  const makeDefault = existing.length === 0 || input.isDefault === true;
  const created: Address = {
    id: crypto.randomUUID(),
    userId: session.userId,
    guestKey: null,
    name: input.name,
    phone,
    line1: input.line1,
    line2: input.line2?.trim() || null,
    city: input.city,
    state: input.state,
    pincode: input.pincode,
    isDefault: makeDefault,
  };

  const items = ensureDefault(
    makeDefault
      ? [created, ...existing.map((item) => ({ ...item, isDefault: false }))]
      : [...existing, created],
  );
  const book = bookFrom(session.userId, items);
  await persistDb(session.userId, items);

  return { items, address: created, book };
}

export async function setDefaultAddress(addressId: string): Promise<AddressMutation> {
  const session = await requireSession();
  const existing = await listAddresses();
  const address = existing.find((item) => item.id === addressId);
  if (!address) {
    throw new AddressError("Address not found.", 404);
  }

  const items = ensureDefault(
    existing.map((item) => ({ ...item, isDefault: item.id === addressId })),
  );
  const book = bookFrom(session.userId, items);
  await persistDb(session.userId, items);

  return { items, address: items.find((item) => item.id === addressId), book };
}

export async function deleteAddress(addressId: string): Promise<AddressMutation> {
  const session = await requireSession();
  const existing = await listAddresses();
  const address = existing.find((item) => item.id === addressId);
  if (!address) {
    throw new AddressError("Address not found.", 404);
  }

  const items = ensureDefault(existing.filter((item) => item.id !== addressId));
  const book = bookFrom(session.userId, items);
  await persistDb(session.userId, items);

  return { items, book };
}
