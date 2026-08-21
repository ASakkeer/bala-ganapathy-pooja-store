import { NextResponse } from "next/server";
import { z } from "zod";
import { AdminError } from "@/server/admin/catalog";
import { getAdminOrder, updateAdminOrderStatus } from "@/server/admin/orders";
import { AuthError, requireAdmin } from "@/server/auth";

const bodySchema = z.object({
  status: z.enum([
    "pending_payment",
    "placed",
    "payment_confirmed",
    "processing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "payment_failed",
  ]),
  shippedAt: z.string().trim().optional(),
  cancelReason: z.string().optional(),
  deliveryMethod: z.enum(["courier", "store"]).optional(),
  courierName: z.string().optional(),
  trackingId: z.string().optional(),
  trackingUrl: z.string().optional(),
  trackingLocation: z.string().optional(),
});

type RouteContext = { params: Promise<{ publicNumber: string }> };

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { publicNumber } = await context.params;
    const order = await getAdminOrder(publicNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load the order." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { publicNumber } = await context.params;
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Choose a valid status." }, { status: 400 });
    }
    const order = await updateAdminOrderStatus(publicNumber, parsed.data);
    return NextResponse.json({ ok: true, order });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
}
