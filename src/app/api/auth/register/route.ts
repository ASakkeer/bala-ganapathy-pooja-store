import { NextResponse } from "next/server";
import { saveRegistrationDetails } from "@/server/auth";
import { jsonAuthError, withIntentCookie } from "@/server/auth-http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; email?: string; phone?: string };
    const result = await saveRegistrationDetails(body, request.headers);
    return withIntentCookie(
      NextResponse.json({
        ok: true,
        phone: result.phone,
        needsPinLogin: result.needsPinLogin,
      }),
      result.intentToken,
    );
  } catch (error) {
    return jsonAuthError(error, "Could not save your details.");
  }
}
