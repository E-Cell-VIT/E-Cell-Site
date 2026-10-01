import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { createAdminStartup } from "@/lib/db/admin-queries";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    if (!body.name || !body.slug || !body.domain || !body.oneLineSummary) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const startup = await createAdminStartup(body, {
      id: admin.id,
      email: admin.email,
    });

    return NextResponse.json({ success: true, startup });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create startup";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
