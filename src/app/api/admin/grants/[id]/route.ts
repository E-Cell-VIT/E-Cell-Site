import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  updateAdminGrant,
  archiveAdminGrant,
  restoreAdminGrant,
  permanentDeleteGrant,
} from "@/lib/db/admin-queries";
import { prisma } from "@/lib/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const grant = await prisma.grant.findUnique({
      where: { id },
      include: { checklistItems: true },
    });
    if (!grant) {
      return NextResponse.json({ error: "Grant not found" }, { status: 404 });
    }

    return NextResponse.json({ grant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch grant" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, ...updateData } = body;

    if (action === "archive") {
      const grant = await archiveAdminGrant(id, admin);
      return NextResponse.json({ success: true, grant });
    }

    if (action === "restore") {
      const grant = await restoreAdminGrant(id, admin);
      return NextResponse.json({ success: true, grant });
    }

    if (updateData.deadlineAt) {
      updateData.deadlineAt = new Date(updateData.deadlineAt);
    }

    updateData.verifiedBy = admin.email;

    const grant = await updateAdminGrant(id, updateData, admin);
    return NextResponse.json({ success: true, grant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update grant" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Permanent deletion requires Super Admin role" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (body.confirmation !== "DELETE") {
      return NextResponse.json(
        { error: "Must confirm permanent deletion with text 'DELETE'" },
        { status: 400 }
      );
    }

    const deleted = await permanentDeleteGrant(id, admin);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete grant" }, { status: 500 });
  }
}
