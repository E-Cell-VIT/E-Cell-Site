import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateApplicationStatus } from "@/lib/db/admin-queries";
import { prisma } from "@/lib/db/client";
import { logAdminAction } from "@/lib/db/audit";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateApplicationStatus(id, body, {
      id: admin.id,
      email: admin.email,
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin("super_admin");
    const { id } = await context.params;

    const application = await prisma.incubationApplication.delete({
      where: { id },
    });

    await logAdminAction({
      adminUserId: admin.id,
      adminEmail: admin.email,
      action: "delete",
      contentType: "IncubationApplication",
      recordId: id,
    });

    return NextResponse.json({ success: true, application });
  } catch {
    return NextResponse.json({ error: "Unauthorized or action failed" }, { status: 403 });
  }
}
