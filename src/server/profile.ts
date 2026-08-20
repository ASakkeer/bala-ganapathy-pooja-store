import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isUuid } from "@/lib/cart";
import {
  decodeProfileCookie,
  encodeProfileCookie,
  isPlaceholderProfileName,
  PROFILE_COOKIE,
  PLACEHOLDER_PROFILE_NAME,
  type StoredProfile,
} from "@/lib/profile-cookie";
import { requireSession } from "@/server/auth";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { isDatabaseConfigured } from "@/server/env";

export class ProfileError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ProfileError";
  }
}

export const profileBodySchema = z.object({
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

export type AccountProfile = {
  userId: string;
  name: string;
  email: string | null;
  phone: string;
  role: "customer" | "admin";
};

export { isPlaceholderProfileName, PLACEHOLDER_PROFILE_NAME };

const memoryProfiles = new Map<string, StoredProfile>();

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  };
}

export function applyProfileCookie(response: NextResponse, profile: StoredProfile) {
  response.cookies.set(PROFILE_COOKIE, encodeProfileCookie(profile), cookieOptions());
  return response;
}

function preferNamed(primary: StoredProfile | null | undefined, secondary: StoredProfile | null | undefined) {
  if (primary && !isPlaceholderProfileName(primary.name)) {
    return primary;
  }

  if (secondary && !isPlaceholderProfileName(secondary.name)) {
    return secondary;
  }

  return primary ?? secondary ?? null;
}

async function readCookieProfile(userId: string) {
  const stored = decodeProfileCookie((await cookies()).get(PROFILE_COOKIE)?.value);
  if (!stored || stored.userId !== userId) {
    return null;
  }

  return stored;
}

export async function getAccountProfile(): Promise<AccountProfile> {
  const session = await requireSession();
  const fromMemory = memoryProfiles.get(session.userId) ?? null;
  const fromCookie = await readCookieProfile(session.userId);
  let fromDb: StoredProfile | null = null;

  if (isDatabaseConfigured() && isUuid(session.userId)) {
    try {
      const db = getDb();
      const row = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });

      if (row) {
        fromDb = { userId: row.id, name: row.name, email: row.email };
      }
    } catch {
      fromDb = null;
    }
  }

  const chosen =
    preferNamed(fromCookie, preferNamed(fromMemory, fromDb)) ??
    fromDb ??
    fromCookie ??
    fromMemory ?? {
      userId: session.userId,
      name: PLACEHOLDER_PROFILE_NAME,
      email: null,
    };

  memoryProfiles.set(session.userId, chosen);

  return {
    userId: session.userId,
    name: chosen.name,
    email: chosen.email,
    phone: session.phone,
    role: session.role,
  };
}

export async function updateAccountProfile(input: z.infer<typeof profileBodySchema>) {
  const session = await requireSession();
  const parsed = profileBodySchema.safeParse(input);
  if (!parsed.success) {
    throw new ProfileError(parsed.error.issues[0]?.message ?? "Check your details and try again.", 400);
  }

  const stored: StoredProfile = {
    userId: session.userId,
    name: parsed.data.name.trim(),
    email: parsed.data.email?.trim() ? parsed.data.email.trim() : null,
  };

  memoryProfiles.set(session.userId, stored);

  if (isDatabaseConfigured() && isUuid(session.userId)) {
    try {
      const db = getDb();
      await db.update(users).set({ name: stored.name, email: stored.email }).where(eq(users.id, session.userId));
    } catch {
      // Cookie and memory still hold the saved profile for this browser.
    }
  }

  return {
    userId: session.userId,
    name: stored.name,
    email: stored.email,
    phone: session.phone,
    role: session.role,
    stored,
  };
}
