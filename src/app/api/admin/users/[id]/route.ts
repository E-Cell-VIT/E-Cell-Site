import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { updateAdminUser, deleteAdminUser } from "@/lib/db/admin-queries";

export async function PUT(
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
        { error: "Forbidden: Managing admin users requires Super Admin role" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const updatePayload: Record<string, unknown> = {};

    if (body.name) updatePayload.name = body.name;
    if (body.role && (body.role === "editor" || body.role === "super_admin")) {
      updatePayload.role = body.role;
    }
    if (body.active !== undefined) {
      if (id === admin.id && body.active === false) {
        return NextResponse.json({ error: "Cannot deactivate your own administrator account" }, { status: 400 });
      }
      updatePayload.active = Boolean(body.active);
    }
    if (body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
      }
      updatePayload.passwordHash = await hashPassword(body.newPassword);
      updatePayload.mustChangePassword = true;
      updatePayload.failedLoginAttempts = 0;
      updatePayload.lockedUntil = null;
    }

    const updated = await updateAdminUser(id, updatePayload as any, admin);
    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
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
        { error: "Forbidden: Deleting admin users requires Super Admin role" },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (id === admin.id) {
      return NextResponse.json({ error: "Cannot delete your own administrator account" }, { status: 400 });
    }

    const deleted = await deleteAdminUser(id, admin);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
