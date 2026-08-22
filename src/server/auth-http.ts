import { NextResponse } from "next/server";
import { AUTH_INTENT_COOKIE, authIntentCookieOptions } from "@/lib/auth-intent";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { AuthError } from "@/server/auth";

export function jsonAuthError(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}

export function withIntentCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_INTENT_COOKIE, token, authIntentCookieOptions());
  return response;
}

export function withSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  response.cookies.set(AUTH_INTENT_COOKIE, "", { ...authIntentCookieOptions(), maxAge: 0 });
  return response;
}
