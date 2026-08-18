import { NextResponse } from "next/server";
import { AuthError, sendOtp } from "@/server/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const result = await sendOtp(body.phone ?? "", request.headers);
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      expiresInSeconds: result.expiresInSeconds,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not send OTP." }, { status: 500 });
  }
}
