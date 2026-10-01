import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  updateAdminStartup,
  archiveAdminStartup,
  restoreAdminStartup,
  permanentDeleteStartup,
} from "@/lib/db/admin-queries";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateAdminStartup(id, body, {
      id: admin.id,
      email: admin.email,
    });

    return NextResponse.json({ success: true, startup: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const { action } = await request.json();

    if (action === "archive") {
      const archived = await archiveAdminStartup(id, {
        id: admin.id,
        email: admin.email,
      });
      return NextResponse.json({ success: true, startup: archived });
    }

    if (action === "restore") {
      const restored = await restoreAdminStartup(id, {
        id: admin.id,
        email: admin.email,
      });
      return NextResponse.json({ success: true, startup: restored });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin("super_admin");
    const { id } = await context.params;
    const { confirmation } = await request.json();

    if (confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Permanent deletion requires typing 'DELETE' to confirm." },
        { status: 400 }
      );
    }

    const deleted = await permanentDeleteStartup(id, {
      id: admin.id,
      email: admin.email,
    });

    return NextResponse.json({ success: true, deleted });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
