import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/server/auth";
import {
  checkoutBodySchema,
  CheckoutError,
  checkoutResponse,
  placeOrder,
} from "@/server/checkout";

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = checkoutBodySchema.parse(await request.json());
    const result = await placeOrder(body);
    return await checkoutResponse(result);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Select a delivery address and try again." }, { status: 400 });
    }

    return NextResponse.json({ error: "Could not place the order." }, { status: 500 });
  }
}
