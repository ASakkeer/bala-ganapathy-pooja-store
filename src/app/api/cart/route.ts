import { NextResponse } from "next/server";
import { AuthError, requireSession } from "@/server/auth";
import { getCart } from "@/server/cart";

export async function GET() {
  try {
    await requireSession();
    const cart = await getCart();
    return NextResponse.json(cart);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not load the cart." }, { status: 500 });
  }
}
