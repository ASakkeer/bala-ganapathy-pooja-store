export const ORDER_COOKIE = "placed_orders";
export const MAX_STORED_ORDERS = 8;

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

export function encodeOrderCookie(book: OrderCookie) {
  const json = JSON.stringify(book);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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
