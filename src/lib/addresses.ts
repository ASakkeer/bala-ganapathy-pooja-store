export const ADDRESS_COOKIE = "address_book";
export const MAX_SAVED_ADDRESSES = 8;

export type AddressCookieItem = {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type AddressCookie = {
  userId: string;
  items: AddressCookieItem[];
};

export function encodeAddressCookie(book: AddressCookie) {
  const json = JSON.stringify(book);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeAddressCookie(raw: string): AddressCookie | null {
  const candidates = [raw];

  try {
    candidates.push(decodeURIComponent(raw));
  } catch {
    /* ignore */
  }

  for (const value of candidates) {
    try {
      const parsed = JSON.parse(fromBase64Url(value)) as AddressCookie;
      if (parsed?.userId && Array.isArray(parsed.items)) {
        return parsed;
      }
    } catch {
      try {
        const parsed = JSON.parse(value) as AddressCookie;
        if (parsed?.userId && Array.isArray(parsed.items)) {
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
