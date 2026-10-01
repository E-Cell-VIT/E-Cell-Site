import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
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

    const old = await prisma.event.findUnique({ where: { id } });

    const updateData: any = { ...body };
    if (body.eventDate) {
      updateData.eventDate = new Date(body.eventDate);
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction({
      adminUserId: admin.id,
      adminEmail: admin.email,
      action: "update",
      contentType: "Event",
      recordId: id,
      oldValues: old as any,
      newValues: updated as any,
    });

    return NextResponse.json({ success: true, event: updated });
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

    const newStatus = action === "archive" ? "Archived" : "Draft";

    const updated = await prisma.event.update({
      where: { id },
      data: { publicationStatus: newStatus },
    });

    await logAdminAction({
      adminUserId: admin.id,
      adminEmail: admin.email,
      action: action === "archive" ? "archive" : "restore",
      contentType: "Event",
      recordId: id,
    });

    return NextResponse.json({ success: true, event: updated });
  } catch {
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
      return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
    }

    const deleted = await prisma.event.delete({ where: { id } });

    await logAdminAction({
      adminUserId: admin.id,
      adminEmail: admin.email,
      action: "delete",
      contentType: "Event",
      recordId: id,
    });

    return NextResponse.json({ success: true, deleted });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
}
