import { NextResponse } from "next/server";
import {
  AdminError,
  archiveAdminProduct,
  getAdminProduct,
  productBodySchema,
  saveAdminProduct,
} from "@/server/admin/catalog";
import { AuthError, requireAdmin } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const product = await getAdminProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load the product." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const existing = await getAdminProduct(id);
    if (!existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    const parsed = productBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product." }, { status: 400 });
    }
    await saveAdminProduct(parsed.data, id);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await archiveAdminProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not archive the product." }, { status: 500 });
  }
}
