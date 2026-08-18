import { NextResponse } from "next/server";
import { applyRazorpayWebhook, PaymentError } from "@/server/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const result = await applyRazorpayWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PaymentError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json({ error: "Webhook rejected." }, { status: 500 });
  }
}
