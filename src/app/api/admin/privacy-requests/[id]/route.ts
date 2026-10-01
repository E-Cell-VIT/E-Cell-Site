import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { updatePrivacyRequestStatus } from "@/lib/db/admin-queries";

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

    const updated = await updatePrivacyRequestStatus(id, body, admin);
    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update privacy request" }, { status: 500 });
  }
}
