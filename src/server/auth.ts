import "server-only";

import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { z } from "zod";
import {
  AUTH_INTENT_COOKIE,
  signAuthIntent,
  verifyAuthIntent,
  type AuthIntent,
} from "@/lib/auth-intent";
import { maskEmail, normalizeIndianPhone } from "@/lib/phone";
import { confirmPinError, pinError } from "@/lib/pin";
import { PLACEHOLDER_PROFILE_NAME } from "@/lib/profile-cookie";
import { SESSION_COOKIE, signSession, verifySession, type SessionPayload } from "@/lib/session";
import { mergeGuestCartForUser } from "@/server/cart";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { env, isDatabaseConfigured } from "@/server/env";
import { isGoogleAuthConfigured, verifyGoogleIdToken } from "@/server/google-auth";
import { hashPin, verifyPinHash } from "@/server/pin";

const registerDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Enter a valid email, or leave it blank.",
    })
    .optional(),
});

const LOOKUP_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOOKUPS_PER_PHONE = 10;
const MAX_LOOKUPS_PER_IP = 30;
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCK_MS = 15 * 60 * 1000;
const MAX_PIN_PER_IP = 20;
const MAX_GOOGLE_PER_IP = 20;

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

type StoredUser = {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  role: "customer" | "admin";
  pinHash: string | null;
  pinFailedAttempts: number;
  pinLockedUntil: Date | null;
  googleSub: string | null;
};

const memoryUsers = new Map<string, StoredUser>();
const sendHits = new Map<string, number[]>();
let dummyPinHash: string | null = null;

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

async function dummyHash() {
  dummyPinHash ??= await hashPin("0000");
  return dummyPinHash;
}

export function requirePhone(raw: string) {
  const phone = normalizeIndianPhone(raw);
  if (!phone) {
    throw new AuthError("Enter a valid 10-digit Indian mobile number.", 400);
  }
  return phone;
}

function requirePin(raw: string) {
  const error = pinError(raw);
  if (error) {
    throw new AuthError(error, 400);
  }
  return raw.replace(/\D/g, "");
}

function normalizeEmail(raw?: string | null) {
  const value = raw?.trim().toLowerCase() ?? "";
  return value || null;
}

function roleForPhone(phone: string): "customer" | "admin" {
  return isAdminPhone(phone) ? "admin" : "customer";
}

function fromRow(row: typeof users.$inferSelect): StoredUser {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    email: row.email,
    role: row.role,
    pinHash: row.pinHash,
    pinFailedAttempts: row.pinFailedAttempts,
    pinLockedUntil: row.pinLockedUntil,
    googleSub: row.googleSub,
  };
}

async function findUserByPhone(phone: string): Promise<StoredUser | null> {
  const memory = [...memoryUsers.values()].find((user) => user.phone === phone);
  if (!isDatabaseConfigured()) {
    return memory ?? null;
  }

  try {
    const db = getDb();
    const row = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });
    return row ? fromRow(row) : memory ?? null;
  } catch {
    return memory ?? null;
  }
}

async function findUserByGoogleSub(sub: string): Promise<StoredUser | null> {
  const memory = [...memoryUsers.values()].find((user) => user.googleSub === sub);
  if (!isDatabaseConfigured()) {
    return memory ?? null;
  }

  try {
    const db = getDb();
    const row = await db.query.users.findFirst({
      where: eq(users.googleSub, sub),
    });
    return row ? fromRow(row) : memory ?? null;
  } catch {
    return memory ?? null;
  }
}

async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const needle = email.toLowerCase();
  const memory = [...memoryUsers.values()].find((user) => user.email?.toLowerCase() === needle);
  if (!isDatabaseConfigured()) {
    return memory ?? null;
  }

  try {
    const db = getDb();
    const row = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${needle}`,
    });
    return row ? fromRow(row) : memory ?? null;
  } catch {
    return memory ?? null;
  }
}

function remember(user: StoredUser) {
  memoryUsers.set(user.id, user);
  return user;
}

async function persistUser(user: StoredUser) {
  remember(user);

  if (!isDatabaseConfigured()) {
    return user;
  }

  try {
    const db = getDb();
    const existing = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          name: user.name,
          email: user.email,
          role: user.role,
          pinHash: user.pinHash,
          pinFailedAttempts: user.pinFailedAttempts,
          pinLockedUntil: user.pinLockedUntil,
          googleSub: user.googleSub,
        })
        .where(eq(users.id, user.id))
        .returning();
      return remember(fromRow(updated));
    }

    const [created] = await db
      .insert(users)
      .values({
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
        pinHash: user.pinHash,
        pinFailedAttempts: user.pinFailedAttempts,
        pinLockedUntil: user.pinLockedUntil,
        googleSub: user.googleSub,
      })
      .returning();
    return remember(fromRow(created));
  } catch (error) {
    if (!memoryUsers.has(user.id)) {
      throw error;
    }
    return user;
  }
}

async function createUser(input: {
  phone: string;
  name: string;
  email: string | null;
  pinHash: string;
  googleSub?: string | null;
}): Promise<StoredUser> {
  const role = roleForPhone(input.phone);
  const draft: StoredUser = {
    id: crypto.randomUUID(),
    phone: input.phone,
    name: input.name,
    email: input.email,
    role,
    pinHash: input.pinHash,
    pinFailedAttempts: 0,
    pinLockedUntil: null,
    googleSub: input.googleSub ?? null,
  };

  if (!isDatabaseConfigured()) {
    return remember(draft);
  }

  try {
    const db = getDb();
    const [created] = await db
      .insert(users)
      .values({
        phone: draft.phone,
        name: draft.name,
        email: draft.email,
        role: draft.role,
        pinHash: draft.pinHash,
        pinFailedAttempts: 0,
        googleSub: draft.googleSub,
      })
      .returning();
    return remember(fromRow(created));
  } catch {
    const again = await findUserByPhone(input.phone);
    if (again?.pinHash) {
      throw new AuthError("This number already has an account. Sign in with your PIN.", 409);
    }
    return remember(draft);
  }
}

async function issueSession(user: StoredUser) {
  const role = roleForPhone(user.phone);
  if (role === "admin" && user.role !== "admin") {
    user = await persistUser({ ...user, role: "admin" });
  }

  await mergeGuestCartForUser(user.id);
  const token = await signSession({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });
  return { token, user };
}

async function signInExistingUserWithGoogle(
  user: StoredUser,
  profile: { sub: string; email?: string | null; name?: string },
) {
  if (user.googleSub && user.googleSub !== profile.sub) {
    throw new AuthError("This account is already linked to another Google sign-in.", 409);
  }

  const nextName =
    user.name && user.name !== PLACEHOLDER_PROFILE_NAME
      ? user.name
      : profile.name?.trim() || user.name;

  const signedIn = await persistUser({
    ...user,
    name: nextName,
    email: user.email ?? normalizeEmail(profile.email) ?? null,
    googleSub: profile.sub,
  });

  const session = await issueSession(signedIn);
  return {
    ...session,
    phone: signedIn.phone,
    signedIn: true as const,
    needsPinLogin: false as const,
  };
}

export async function readAuthIntent(): Promise<AuthIntent | null> {
  return verifyAuthIntent((await cookies()).get(AUTH_INTENT_COOKIE)?.value);
}

export async function writeAuthIntent(input: Omit<AuthIntent, "exp">) {
  return signAuthIntent(input);
}

function rateLimitOrThrow(key: string, windowMs: number, max: number, message: string) {
  if (!allowHit(key, windowMs, max)) {
    throw new AuthError(message, 429);
  }
}

export async function lookupPhone(rawPhone: string, headers: Headers) {
  const phone = requirePhone(rawPhone);
  const ip = clientIp(headers);
  rateLimitOrThrow(`lookup:phone:${phone}`, LOOKUP_WINDOW_MS, MAX_LOOKUPS_PER_PHONE, "Too many tries for this number. Wait and try again.");
  rateLimitOrThrow(`lookup:ip:${ip}`, LOOKUP_WINDOW_MS, MAX_LOOKUPS_PER_IP, "Too many tries. Wait and try again.");

  const user = await findUserByPhone(phone);
  const exists = Boolean(user);
  const hasPin = Boolean(user?.pinHash);
  const needsPinSetup = exists && !hasPin;

  const intentToken = await writeAuthIntent(
    needsPinSetup
      ? {
          phone,
          name: user?.name,
          email: user?.email,
          stage: "set-pin",
        }
      : {
          phone,
          stage: exists ? "pin" : "register",
        },
  );

  return {
    phone,
    exists,
    hasPin,
    needsPinSetup,
    intentToken,
  };
}

async function verifyExistingPin(user: StoredUser, pin: string) {
  if (user.pinLockedUntil && user.pinLockedUntil.getTime() > Date.now()) {
    throw new AuthError("Too many incorrect PINs. Try again after 15 minutes, or reset your PIN.", 429);
  }

  let ok = false;
  if (user.pinHash) {
    ok = await verifyPinHash(pin, user.pinHash);
  } else if (isAdminPhone(user.phone) && env.ADMIN_PIN && pin === env.ADMIN_PIN) {
    ok = true;
  } else {
    await verifyPinHash(pin, await dummyHash());
  }

  if (!ok) {
    const attempts = user.pinFailedAttempts + 1;
    const locked = attempts >= MAX_PIN_ATTEMPTS ? new Date(Date.now() + PIN_LOCK_MS) : user.pinLockedUntil;
    await persistUser({
      ...user,
      pinFailedAttempts: attempts,
      pinLockedUntil: locked ?? null,
    });
    if (locked && attempts >= MAX_PIN_ATTEMPTS) {
      throw new AuthError("Too many incorrect PINs. Try again after 15 minutes, or reset your PIN.", 429);
    }
    throw new AuthError("That PIN is not correct.", 400);
  }

  let next = user;
  if (!user.pinHash) {
    next = { ...next, pinHash: await hashPin(pin) };
  }

  return persistUser({
    ...next,
    pinFailedAttempts: 0,
    pinLockedUntil: null,
  });
}

export async function loginWithPin(rawPhone: string, rawPin: string, headers: Headers) {
  const phone = requirePhone(rawPhone);
  const pin = rawPin.replace(/\D/g, "");
  if (!/^\d{4}$/.test(pin)) {
    throw new AuthError("Enter your 4-digit PIN.", 400);
  }

  const ip = clientIp(headers);
  rateLimitOrThrow(`pin:ip:${ip}`, LOOKUP_WINDOW_MS, MAX_PIN_PER_IP, "Too many PIN tries. Wait and try again.");
  rateLimitOrThrow(`pin:phone:${phone}`, LOOKUP_WINDOW_MS, MAX_PIN_ATTEMPTS + 3, "Too many PIN tries for this number. Wait and try again.");

  const intent = await readAuthIntent();
  if (!intent?.phone || intent.phone !== phone) {
    throw new AuthError("Enter your mobile number again.", 400);
  }

  const user = await findUserByPhone(phone);
  if (!user) {
    await verifyPinHash(pin, await dummyHash());
    throw new AuthError("No account for this number. Create one to continue.", 404);
  }

  if (!user.pinHash && !(isAdminPhone(phone) && env.ADMIN_PIN)) {
    throw new AuthError("This number needs a PIN reset. Sign in with Google if you linked it, or contact the shop.", 409);
  }

  const signedIn = await verifyExistingPin(user, pin);
  if (intent.googleSub && signedIn.googleSub !== intent.googleSub) {
    return issueSession(
      await persistUser({
        ...signedIn,
        googleSub: intent.googleSub,
        email: signedIn.email ?? intent.googleEmail ?? null,
      }),
    );
  }

  return issueSession(signedIn);
}

export async function saveRegistrationDetails(
  input: { name?: string; email?: string; phone?: string },
  headers: Headers,
): Promise<
  | { phone: string; signedIn: true; token: string; user: StoredUser; needsPinLogin: false }
  | { phone: string; signedIn: false; intentToken: string; needsPinLogin: boolean }
> {
  const intent = await readAuthIntent();
  if (!intent || (intent.stage !== "register" && intent.stage !== "set-pin" && intent.stage !== "google")) {
    throw new AuthError("Enter your mobile number first.", 400);
  }

  const phone = intent.phone ?? (input.phone ? requirePhone(input.phone) : null);
  if (!phone) {
    throw new AuthError("Enter your 10-digit mobile number.", 400);
  }

  rateLimitOrThrow(
    `register:ip:${clientIp(headers)}`,
    LOOKUP_WINDOW_MS,
    MAX_LOOKUPS_PER_IP,
    "Too many tries. Wait and try again.",
  );

  const parsed = registerDetailsSchema.safeParse({
    name: input.name ?? "",
    email: input.email ?? "",
  });
  if (!parsed.success) {
    throw new AuthError(parsed.error.issues[0]?.message ?? "Check your details and try again.", 400);
  }

  const existing = await findUserByPhone(phone);
  if (existing && intent.googleSub) {
    return signInExistingUserWithGoogle(existing, {
      sub: intent.googleSub,
      email: intent.googleEmail ?? parsed.data.email,
      name: parsed.data.name.trim(),
    });
  }

  if (existing?.pinHash) {
    throw new AuthError("This number already has an account. Sign in with your PIN.", 409);
  }

  const email = normalizeEmail(intent.googleEmail ?? parsed.data.email);
  const intentToken = await writeAuthIntent({
    phone,
    name: parsed.data.name.trim(),
    email,
    googleSub: intent.googleSub,
    googleEmail: intent.googleEmail ?? email ?? undefined,
    stage: "set-pin",
  });

  return { phone, intentToken, needsPinLogin: false as const, signedIn: false as const };
}

export async function setPinAndCreateAccount(rawPin: string, rawConfirm: string, headers: Headers) {
  const mismatch = confirmPinError(rawPin, rawConfirm);
  if (mismatch) {
    throw new AuthError(mismatch, 400);
  }
  const pin = requirePin(rawPin);
  rateLimitOrThrow(`setpin:ip:${clientIp(headers)}`, LOOKUP_WINDOW_MS, MAX_PIN_PER_IP, "Too many tries. Wait and try again.");

  const intent = await readAuthIntent();
  if (!intent?.phone || intent.stage !== "set-pin") {
    throw new AuthError("Save your name first, then set a PIN.", 400);
  }

  const existing = await findUserByPhone(intent.phone);
  if (existing?.pinHash) {
    throw new AuthError("This number already has an account. Sign in with your PIN.", 409);
  }

  const requestedName = intent.name?.trim();
  const name =
    requestedName && requestedName !== PLACEHOLDER_PROFILE_NAME
      ? requestedName
      : existing?.name?.trim();

  if (!name) {
    throw new AuthError("Enter your name before setting a PIN.", 400);
  }

  const pinHash = await hashPin(pin);

  if (existing) {
    const signedIn = await persistUser({
      ...existing,
      name,
      email: intent.email ?? existing.email,
      pinHash,
      pinFailedAttempts: 0,
      pinLockedUntil: null,
      googleSub: intent.googleSub ?? existing.googleSub,
    });
    return issueSession(signedIn);
  }

  if (name === PLACEHOLDER_PROFILE_NAME) {
    throw new AuthError("Enter your name before setting a PIN.", 400);
  }

  const created = await createUser({
    phone: intent.phone,
    name,
    email: intent.email ?? null,
    pinHash,
    googleSub: intent.googleSub ?? null,
  });
  return issueSession(created);
}

export async function loginWithGoogle(credential: string, headers: Headers) {
  if (!isGoogleAuthConfigured()) {
    throw new AuthError("Google sign-in is not available yet.", 503);
  }

  if (!credential.trim()) {
    throw new AuthError("Google sign-in was cancelled.", 400);
  }

  rateLimitOrThrow(`google:ip:${clientIp(headers)}`, LOOKUP_WINDOW_MS, MAX_GOOGLE_PER_IP, "Too many Google sign-in tries. Wait and try again.");

  let profile;
  try {
    profile = await verifyGoogleIdToken(credential);
  } catch {
    throw new AuthError("Google sign-in could not be verified. Try again.", 401);
  }

  const bySub = await findUserByGoogleSub(profile.sub);
  if (bySub) {
    return { kind: "session" as const, ...(await issueSession(bySub)) };
  }

  const byEmail = profile.email ? await findUserByEmail(profile.email) : null;
  if (byEmail) {
    const signedIn = await signInExistingUserWithGoogle(byEmail, profile);
    return { kind: "session" as const, token: signedIn.token, user: signedIn.user };
  }

  const intentToken = await writeAuthIntent({
    name: profile.name || undefined,
    email: profile.email,
    googleSub: profile.sub,
    googleEmail: profile.email,
    stage: "google",
  });

  return { kind: "register" as const, name: profile.name, email: profile.email, intentToken };
}

export async function forgotPinInfo(rawPhone: string, headers: Headers) {
  const phone = requirePhone(rawPhone);
  rateLimitOrThrow(`forgot:ip:${clientIp(headers)}`, LOOKUP_WINDOW_MS, MAX_LOOKUPS_PER_IP, "Too many tries. Wait and try again.");
  rateLimitOrThrow(`forgot:phone:${phone}`, LOOKUP_WINDOW_MS, MAX_LOOKUPS_PER_PHONE, "Too many tries for this number. Wait and try again.");

  const user = await findUserByPhone(phone);
  return {
    phone,
    exists: Boolean(user),
    hasGoogle: Boolean(user?.googleSub),
    emailMasked: user?.email ? maskEmail(user.email) : null,
  };
}

export async function adminClearPin(rawPhone: string) {
  const phone = requirePhone(rawPhone);
  const user = await findUserByPhone(phone);
  if (!user) {
    throw new AuthError("No account for that number.", 404);
  }

  const hadPin = Boolean(user.pinHash);
  await persistUser({
    ...user,
    pinHash: null,
    pinFailedAttempts: 0,
    pinLockedUntil: null,
  });

  return { phone, hadPin };
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
