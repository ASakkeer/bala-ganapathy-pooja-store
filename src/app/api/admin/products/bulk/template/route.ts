import { NextResponse } from "next/server";
import { downloadProductSheetTemplate } from "@/server/admin/product-bulk";
import { AuthError, requireAdmin } from "@/server/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const buffer = await downloadProductSheetTemplate();
    return new NextResponse(Uint8Array.from(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="bgps-products-template.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Could not build the template." }, { status: 500 });
  }
}
