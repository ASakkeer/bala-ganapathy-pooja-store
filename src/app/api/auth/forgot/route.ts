import { NextResponse } from "next/server";
import { forgotPinInfo } from "@/server/auth";
import { jsonAuthError } from "@/server/auth-http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const result = await forgotPinInfo(body.phone ?? "", request.headers);
    return NextResponse.json({
      ok: true,
      exists: result.exists,
      hasGoogle: result.hasGoogle,
      emailMasked: result.emailMasked,
    });
  } catch (error) {
    return jsonAuthError(error, "Could not look up that number.");
  }
}
