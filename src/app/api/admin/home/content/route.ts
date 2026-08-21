import { NextResponse } from "next/server";
import { AdminError } from "@/server/admin/catalog";
import { homeContentBodySchema, saveAdminHomeContent } from "@/server/admin/settings";
import { AuthError, requireAdmin } from "@/server/auth";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = homeContentBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid home page text." },
        { status: 400 },
      );
    }
    const homeContent = await saveAdminHomeContent(parsed.data);
    return NextResponse.json({ ok: true, homeContent });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save the home page text." }, { status: 500 });
  }
}
