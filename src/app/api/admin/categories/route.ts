import { NextResponse } from "next/server";
import {
  AdminError,
  categoryBodySchema,
  saveAdminCategory,
} from "@/server/admin/catalog";
import { AuthError, requireAdmin } from "@/server/auth";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = categoryBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid category." }, { status: 400 });
    }
    const id = await saveAdminCategory(parsed.data);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the category." }, { status: 500 });
  }
}
