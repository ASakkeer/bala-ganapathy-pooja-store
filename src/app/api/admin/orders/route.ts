import { NextResponse } from "next/server";
import { AdminError } from "@/server/admin/catalog";
import { listAdminOrders } from "@/server/admin/orders";
import { AuthError, requireAdmin } from "@/server/auth";

export async function GET() {
  try {
    await requireAdmin();
    const orders = await listAdminOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
