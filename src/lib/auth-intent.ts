import { getAuthSecret } from "@/lib/session";

export const AUTH_INTENT_COOKIE = "bgps_auth";
export const AUTH_INTENT_TTL_SECONDS = 60 * 15;

export type AuthIntent = {
  phone?: string;
  name?: string;
  email?: string | null;
  googleSub?: string;
  googleEmail?: string;
  stage: "phone" | "pin" | "register" | "set-pin" | "google";
  exp: number;
};

export function authIntentCookieOptions(maxAge = AUTH_INTENT_TTL_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function utf8ToBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}

async function hmacSha256(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signAuthIntent(input: Omit<AuthIntent, "exp">) {
  const payload: AuthIntent = {
    ...input,
    exp: Math.floor(Date.now() / 1000) + AUTH_INTENT_TTL_SECONDS,
  };
  const body = utf8ToBase64Url(JSON.stringify(payload));
  const signature = await hmacSha256(getAuthSecret(), body);
  return `${body}.${signature}`;
}

export async function verifyAuthIntent(token: string | undefined): Promise<AuthIntent | null> {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  try {
    const expected = await hmacSha256(getAuthSecret(), body);
    if (!timingSafeEqual(signature, expected)) {
      return null;
    }

    const payload = JSON.parse(base64UrlToUtf8(body)) as AuthIntent;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (
      payload.stage !== "phone" &&
      payload.stage !== "pin" &&
      payload.stage !== "register" &&
      payload.stage !== "set-pin" &&
      payload.stage !== "google"
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
