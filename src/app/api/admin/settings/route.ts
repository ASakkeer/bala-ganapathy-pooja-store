import { NextResponse } from "next/server";
import { AdminError } from "@/server/admin/catalog";
import { getAdminSettings, saveAdminSettings, settingsBodySchema } from "@/server/admin/settings";
import { AuthError, requireAdmin } from "@/server/auth";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getAdminSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not load settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const parsed = settingsBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings." }, { status: 400 });
    }
    const settings = await saveAdminSettings(parsed.data);
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    if (error instanceof AuthError || error instanceof AdminError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
  }
}
