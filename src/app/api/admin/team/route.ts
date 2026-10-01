import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminTeamMembers, createAdminTeamMember } from "@/lib/db/admin-queries";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const academicYear = searchParams.get("academicYear") || undefined;
    const publicationStatus = searchParams.get("publicationStatus") || undefined;

    const members = await getAdminTeamMembers({ category, academicYear, publicationStatus });
    return NextResponse.json({ members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, photoUrl, designation, organisation, linkedinUrl, category, academicYear, isCurrent, publicationStatus, displayOrder } = body;

    if (!name || !designation || !category) {
      return NextResponse.json(
        { error: "Missing required fields (name, designation, category)" },
        { status: 400 }
      );
    }

    const member = await createAdminTeamMember(
      {
        name,
        photoUrl: photoUrl || null,
        designation,
        organisation: organisation || null,
        linkedinUrl: linkedinUrl || null,
        category,
        academicYear: academicYear || "2026-27",
        isCurrent: isCurrent !== undefined ? Boolean(isCurrent) : true,
        publicationStatus: publicationStatus || "Published",
        displayOrder: displayOrder ? Number(displayOrder) : 0,
      },
      admin
    );

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create team member" }, { status: 500 });
  }
}
