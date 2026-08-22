import { NextResponse } from "next/server";
import { loginWithPin } from "@/server/auth";
import { jsonAuthError, withSessionCookie } from "@/server/auth-http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; pin?: string };
    const result = await loginWithPin(body.phone ?? "", body.pin ?? "", request.headers);
    return withSessionCookie(
      NextResponse.json({
        ok: true,
        phone: result.user.phone,
        role: result.user.role,
      }),
      result.token,
    );
  } catch (error) {
    return jsonAuthError(error, "Could not sign in with that PIN.");
  }
}
