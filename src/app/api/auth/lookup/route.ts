import { NextResponse } from "next/server";
import { lookupPhone } from "@/server/auth";
import { jsonAuthError, withIntentCookie } from "@/server/auth-http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const result = await lookupPhone(body.phone ?? "", request.headers);
    return withIntentCookie(
      NextResponse.json({
        ok: true,
        phone: result.phone,
        exists: result.exists,
        hasPin: result.hasPin,
      }),
      result.intentToken,
    );
  } catch (error) {
    return jsonAuthError(error, "Could not check that number.");
  }
}
