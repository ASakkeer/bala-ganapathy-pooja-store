import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { createHash, randomInt } from "crypto";
import { normalizeIndianPhone } from "@/lib/phone";
import {
  getAuthSecret,
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionPayload,
} from "@/lib/session";
import { mergeGuestCartForUser } from "@/server/cart";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { env, isDatabaseConfigured } from "@/server/env";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const SEND_WINDOW_MS = 15 * 60 * 1000;
const MAX_SENDS_PER_PHONE = 5;
const MAX_SENDS_PER_IP = 10;

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type OtpRecord = {
  phone: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
};

const otpByPhone = new Map<string, OtpRecord>();
const sendHits = new Map<string, number[]>();

function hashOtp(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}:${getAuthSecret()}`).digest("hex");
}

function allowHit(key: string, windowMs: number, max: number) {
  const now = Date.now();
  const recent = (sendHits.get(key) ?? []).filter((at) => now - at < windowMs);

  if (recent.length >= max) {
    return false;
  }

  recent.push(now);
  sendHits.set(key, recent);
  return true;
}

function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "local";
  }

  return headers.get("x-real-ip")?.trim() || "local";
}

export function requirePhone(raw: string) {
  const phone = normalizeIndianPhone(raw);
  if (!phone) {
    throw new AuthError("Enter a valid 10-digit Indian mobile number.", 400);
  }
  return phone;
}

export async function sendOtp(rawPhone: string, headers: Headers) {
  const phone = requirePhone(rawPhone);
  const ip = clientIp(headers);

  if (!allowHit(`phone:${phone}`, SEND_WINDOW_MS, MAX_SENDS_PER_PHONE)) {
    throw new AuthError("Too many OTP requests for this number. Try later.", 429);
  }

  if (!allowHit(`ip:${ip}`, SEND_WINDOW_MS, MAX_SENDS_PER_IP)) {
    throw new AuthError("Too many OTP requests. Try later.", 429);
  }

  if (process.env.NODE_ENV === "production") {
    throw new AuthError("SMS is not configured yet. Login cannot send OTP in production.", 503);
  }

  const code = String(randomInt(100000, 1000000));
  otpByPhone.set(phone, {
    phone,
    codeHash: hashOtp(phone, code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  console.info(`[otp] ${phone} ${code}`);
  return { phone, expiresInSeconds: OTP_TTL_MS / 1000 };
}

async function upsertUser(phone: string): Promise<{ id: string; phone: string; role: "customer" | "admin" }> {
  const role = isAdminPhone(phone) ? "admin" : "customer";

  if (!isDatabaseConfigured()) {
    return { id: `user-${phone}`, phone, role };
  }

  try {
    const db = getDb();
    const existing = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (existing) {
      if (role === "admin" && existing.role !== "admin") {
        const [updated] = await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, existing.id))
          .returning();
        return { id: updated.id, phone: updated.phone, role: updated.role };
      }

      return { id: existing.id, phone: existing.phone, role: existing.role };
    }

    const [created] = await db
      .insert(users)
      .values({ phone, name: "Customer", role })
      .returning();

    return { id: created.id, phone: created.phone, role: created.role };
  } catch {
    return { id: `user-${phone}`, phone, role };
  }
}

export async function verifyOtp(rawPhone: string, code: string) {
  const phone = requirePhone(rawPhone);
  const trimmed = code.trim();

  if (!/^\d{6}$/.test(trimmed)) {
    throw new AuthError("Enter the 6-digit code.", 400);
  }

  const record = otpByPhone.get(phone);

  if (!record || record.expiresAt < Date.now()) {
    otpByPhone.delete(phone);
    throw new AuthError("That code has expired. Request a new one.", 400);
  }

  record.attempts += 1;

  if (record.attempts > MAX_ATTEMPTS) {
    otpByPhone.delete(phone);
    throw new AuthError("Too many attempts. Request a new code.", 429);
  }

  if (record.codeHash !== hashOtp(phone, trimmed)) {
    throw new AuthError("That code is not correct.", 400);
  }

  otpByPhone.delete(phone);
  const user = await upsertUser(phone);
  await mergeGuestCartForUser(user.id);
  const token = await signSession({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  return { token, user };
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifySession(token);
});

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Please sign in to continue.", 401);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== "admin") {
    throw new AuthError("Admin access only.", 403);
  }
  return session;
}

export function isAdminPhone(phone: string) {
  const configured = env.ADMIN_PHONE?.replace(/\D/g, "") ?? "";
  if (!configured) {
    return false;
  }

  const lastTen = configured.slice(-10);
  return lastTen === phone || configured === phone;
}
