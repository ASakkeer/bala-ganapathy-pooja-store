import "server-only";

import { z } from "zod";

/**
 * Env is validated here. AUTH_SECRET stays optional until Phase 10. DATABASE_URL
 * is still optional at boot so `next build` and `next dev` work without Postgres.
 * Product queries call `requireDatabaseUrl()` when they actually touch the database.
 */
const optionalNonEmptyString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().min(1).optional());

const envSchema = z.object({
  DATABASE_URL: optionalNonEmptyString,
  RAZORPAY_KEY_ID: optionalNonEmptyString,
  RAZORPAY_KEY_SECRET: optionalNonEmptyString,
  RAZORPAY_WEBHOOK_SECRET: optionalNonEmptyString,
  AUTH_SECRET: optionalNonEmptyString,
  ADMIN_PHONE: optionalNonEmptyString,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: optionalNonEmptyString,
  NEXT_PUBLIC_SITE_URL: optionalNonEmptyString,
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_PHONE: process.env.ADMIN_PHONE,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedEnv.success) {
  throw new Error(`Invalid environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;

function requireEnv(name: keyof typeof env, phase: string): string {
  const value = env[name];

  if (!value) {
    throw new Error(
      `${name} is required for this feature (${phase}). Set it in .env.local.`,
    );
  }

  return value;
}

export function requireDatabaseUrl(): string {
  return requireEnv("DATABASE_URL", "Phase 4");
}

export function requireAuthSecret(): string {
  return requireEnv("AUTH_SECRET", "Phase 10");
}

export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  );
}

export function requireRazorpayKeys() {
  const keyId = requireEnv("RAZORPAY_KEY_ID", "Phase 12");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET", "Phase 12");
  const publicKeyId = requireEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", "Phase 12");

  if (keyId !== publicKeyId) {
    throw new Error("RAZORPAY_KEY_ID must match NEXT_PUBLIC_RAZORPAY_KEY_ID.");
  }

  return { keyId, keySecret, publicKeyId };
}

export function requireRazorpayWebhookSecret() {
  return requireEnv("RAZORPAY_WEBHOOK_SECRET", "Phase 12");
}
