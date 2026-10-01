import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import {
  updateAdminBlog,
  archiveAdminBlog,
  restoreAdminBlog,
  permanentDeleteBlog,
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
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blog" }, { status: 500 });
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
      const blog = await archiveAdminBlog(id, admin);
      return NextResponse.json({ success: true, blog });
    }

    if (action === "restore") {
      const blog = await restoreAdminBlog(id, admin);
      return NextResponse.json({ success: true, blog });
    }

    const blog = await updateAdminBlog(id, updateData, admin);
    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update blog" }, { status: 500 });
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

    const deleted = await permanentDeleteBlog(id, admin);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete blog" }, { status: 500 });
  }
}
