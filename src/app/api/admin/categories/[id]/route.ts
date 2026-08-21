import { NextResponse } from "next/server";
import {
  AdminError,
  categoryBodySchema,
  deleteAdminCategory,
  saveAdminCategory,
} from "@/server/admin/catalog";
import { AuthError, requireAdmin } from "@/server/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const parsed = categoryBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid category." }, { status: 400 });
    }
    await saveAdminCategory(parsed.data, id);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the category." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    await deleteAdminCategory(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not remove the category." }, { status: 500 });
  }
}
