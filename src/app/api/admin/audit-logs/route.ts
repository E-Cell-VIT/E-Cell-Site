import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminAuditLogs } from "@/lib/db/admin-queries";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Viewing audit logs requires Super Admin role" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || undefined;
    const contentType = searchParams.get("contentType") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const pageSize = searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 30;

    const data = await getAdminAuditLogs({ action, contentType, search, page, pageSize });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
