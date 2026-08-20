import { NextResponse } from "next/server";
import { AuthError } from "@/server/auth";
import { applyOrderCookie, orderIsPayable, upsertOrderCookie } from "@/server/checkout";
import { markRazorpayPaymentFailed, PaymentError } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      publicNumber?: string;
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      reason?: string;
    };

    const publicNumber = body.publicNumber?.trim() ?? "";
    if (!publicNumber) {
      return NextResponse.json({ error: "Order number is required." }, { status: 400 });
    }

    const updated = await markRazorpayPaymentFailed({
      publicNumber,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      reason: body.reason,
    });

    const response = NextResponse.json({
      ok: true,
      publicNumber: updated.publicNumber,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
      payable: orderIsPayable(updated),
    });
    applyOrderCookie(response, await upsertOrderCookie(updated));
    return response;
  } catch (error) {
    if (error instanceof AuthError || error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Could not record the failed payment." }, { status: 500 });
  }
}
