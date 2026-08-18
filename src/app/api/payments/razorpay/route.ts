import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import { applyOrderCookie, getOrderByPublicNumber, upsertOrderCookie } from "@/server/checkout";
import { createRazorpayOrder, PaymentError } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { publicNumber?: string };
    const publicNumber = body.publicNumber?.trim();
    if (!publicNumber) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }

    const payload = await createRazorpayOrder(publicNumber);
    const order = await getOrderByPublicNumber(publicNumber);
    const response = NextResponse.json(payload);
    if (order) {
      applyOrderCookie(response, await upsertOrderCookie(order));
    }
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not start payment." }, { status: 500 });
  }
}
