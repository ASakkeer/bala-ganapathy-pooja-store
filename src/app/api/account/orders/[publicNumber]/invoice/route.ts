import { NextResponse } from "next/server";
import { PRIVATE_CACHE_CONTROL } from "@/lib/cache";
import { orderInvoiceAvailable, orderInvoiceFilename } from "@/lib/order-invoice";
import { getSession } from "@/server/auth";
import { getOwnedOrder } from "@/server/orders";
import { buildOrderInvoicePdf } from "@/server/order-invoice-pdf";
import { getStoreSettings } from "@/server/queries/store";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ publicNumber: string }> };

export async function GET(_: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in to download this invoice." }, { status: 401 });
    }

    const { publicNumber } = await context.params;
    const order = await getOwnedOrder(decodeURIComponent(publicNumber));
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (!orderInvoiceAvailable(order.status)) {
      return NextResponse.json(
        { error: "Invoice is available after the order is delivered." },
        { status: 409 },
      );
    }

    const settings = await getStoreSettings();
    const pdf = await buildOrderInvoicePdf(order, {
      address: settings?.address,
      phones: settings?.phones,
    });
    const filename = orderInvoiceFilename(order.publicNumber);

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": PRIVATE_CACHE_CONTROL,
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not create the invoice." }, { status: 500 });
  }
}
