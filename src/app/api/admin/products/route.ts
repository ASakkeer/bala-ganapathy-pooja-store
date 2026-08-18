import { NextResponse } from "next/server";
import { AdminError, listAdminProducts, productBodySchema, saveAdminProduct } from "@/server/admin/catalog";
import { AuthError, requireAdmin } from "@/server/auth";

export async function GET() {
  try {
    await requireAdmin();
    const products = await listAdminProducts();
    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = productBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product." }, { status: 400 });
    }
    const id = await saveAdminProduct(parsed.data);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}
