import { NextResponse } from "next/server";
import { AdminError, homeTileBodySchema, saveAdminHomeTile } from "@/server/admin/catalog";
import { AuthError, requireAdmin } from "@/server/auth";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = homeTileBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid tile." }, { status: 400 });
    }
    await saveAdminHomeTile(parsed.data.slug, parsed.data.image);
    return NextResponse.json({ ok: true, slug: parsed.data.slug });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the tile." }, { status: 500 });
  }
}
