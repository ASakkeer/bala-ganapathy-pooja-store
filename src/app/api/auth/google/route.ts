import { NextResponse } from "next/server";
import { loginWithGoogle } from "@/server/auth";
import { jsonAuthError, withIntentCookie, withSessionCookie } from "@/server/auth-http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { credential?: string };
    const result = await loginWithGoogle(body.credential ?? "", request.headers);

    if (result.kind === "session") {
      return withSessionCookie(
        NextResponse.json({
          ok: true,
          kind: result.kind,
          phone: result.user.phone,
          role: result.user.role,
        }),
        result.token,
      );
    }

    return withIntentCookie(
      NextResponse.json({
        ok: true,
        kind: result.kind,
        name: result.name,
        email: result.email,
      }),
      result.intentToken,
    );
  } catch (error) {
    return jsonAuthError(error, "Could not sign in with Google.");
  }
}
