import { NextResponse } from "next/server";
import { adminClearPin, AuthError, requireAdmin } from "@/server/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as { phone?: string };
    const result = await adminClearPin(body.phone ?? "");
    return NextResponse.json({
      ok: true,
      phone: result.phone,
      hadPin: result.hadPin,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not clear that PIN." }, { status: 500 });
  }
}
