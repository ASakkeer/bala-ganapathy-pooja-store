import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { AuthError, verifyOtp } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; code?: string };
    const result = await verifyOtp(body.phone ?? "", body.code ?? "");
    const response = NextResponse.json({
      ok: true,
      phone: result.user.phone,
      role: result.user.role,
    });
    response.cookies.set(SESSION_COOKIE, result.token, sessionCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not verify OTP." }, { status: 500 });
  }
}
