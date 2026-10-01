import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { rolloverAcademicYear } from "@/lib/db/admin-queries";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newAcademicYear } = body;

    if (!newAcademicYear) {
      return NextResponse.json({ error: "New academic year string is required (e.g. 2027-28)" }, { status: 400 });
    }

    const result = await rolloverAcademicYear(newAcademicYear, admin);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to rollover academic year" }, { status: 500 });
  }
}
