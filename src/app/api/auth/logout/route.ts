import { NextResponse } from "next/server";
import { AUTH_INTENT_COOKIE, authIntentCookieOptions } from "@/lib/auth-intent";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const expired = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
  response.cookies.set(SESSION_COOKIE, "", expired);
  response.cookies.set(AUTH_INTENT_COOKIE, "", { ...authIntentCookieOptions(), maxAge: 0 });
  return response;
}
