export const ORDER_COOKIE = "placed_orders";
export const MAX_STORED_ORDERS = 8;
/** Browsers drop cookies over ~4KB. Keep the encoded value under this so the latest order always sticks. */
export const MAX_ORDER_COOKIE_CHARS = 3500;

export type StoredOrder = {
  id: string;
  publicNumber: string;
  userId?: string | null;
  phone: string;
  address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: string;
  paymentStatus: string;
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

export type OrderCookie = {
  userId: string;
  orders: StoredOrder[];
};

function encodeBook(book: OrderCookie) {
  const json = JSON.stringify(book);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Newest orders first. Drops oldest snapshots until the cookie fits in a browser. */
export function fitOrderCookie(book: OrderCookie): OrderCookie {
  let orders = book.orders.slice(0, MAX_STORED_ORDERS);
  let fitted: OrderCookie = { userId: book.userId, orders };

  while (orders.length > 1 && encodeBook(fitted).length > MAX_ORDER_COOKIE_CHARS) {
    orders = orders.slice(0, -1);
    fitted = { userId: book.userId, orders };
  }

  return fitted;
}

export function encodeOrderCookie(book: OrderCookie) {
  return encodeBook(fitOrderCookie(book));
}

export function decodeOrderCookie(raw: string): OrderCookie | null {
  const candidates = [raw];

  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    /* ignore */
  }

  for (const value of candidates) {
    try {
      const parsed = JSON.parse(fromBase64Url(value)) as OrderCookie;
      if (parsed?.userId && Array.isArray(parsed.orders)) {
        return parsed;
      }
    } catch {
      try {
        const parsed = JSON.parse(value) as OrderCookie;
        if (parsed?.userId && Array.isArray(parsed.orders)) {
          return parsed;
        }
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
