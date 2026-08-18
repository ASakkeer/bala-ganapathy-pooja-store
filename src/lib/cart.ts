/** Integer-paise cart math. Shared with checkout later. */

export const MAX_LINE_QTY = 99;
export const CART_COOKIE = "cart_id";

export type CartCookieItem = {
  variantId: string;
  qty: number;
};

export type CartCookie = {
  id: string;
  items: CartCookieItem[];
};

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function computeCartTotals(subtotalPaise: number, shippingPaise: number) {
  if (!Number.isInteger(subtotalPaise) || !Number.isInteger(shippingPaise)) {
    throw new Error("Cart totals must be integer paise.");
  }

  if (subtotalPaise < 0 || shippingPaise < 0) {
    throw new Error("Cart totals cannot be negative.");
  }

  return {
    subtotalPaise,
    shippingPaise,
    grandTotalPaise: subtotalPaise + shippingPaise,
  };
}

export function lineTotalPaise(pricePaise: number, qty: number) {
  if (!Number.isInteger(pricePaise) || !Number.isInteger(qty)) {
    throw new Error("Line totals must use integer paise and qty.");
  }

  return pricePaise * qty;
}

export function encodeCartCookie(cart: CartCookie) {
  const json = JSON.stringify(cart);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCartCookie(raw: string): CartCookie | null {
  const candidates = [raw];

  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    /* ignore */
  }

  for (const value of candidates) {
    try {
      return JSON.parse(fromBase64Url(value)) as CartCookie;
    } catch {
      try {
        return JSON.parse(value) as CartCookie;
      } catch {
        /* try next */
      }
    }
  }

  return null;
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
