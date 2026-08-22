import { NextResponse } from "next/server";
import { setPinAndCreateAccount } from "@/server/auth";
import { jsonAuthError, withSessionCookie } from "@/server/auth-http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { pin?: string; confirmPin?: string };
    const result = await setPinAndCreateAccount(body.pin ?? "", body.confirmPin ?? "", request.headers);
    return withSessionCookie(
      NextResponse.json({
        ok: true,
        phone: result.user.phone,
        role: result.user.role,
      }),
      result.token,
    );
  } catch (error) {
    return jsonAuthError(error, "Could not save your PIN.");
  }
}
