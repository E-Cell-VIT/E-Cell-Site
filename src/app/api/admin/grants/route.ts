import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminGrants, createAdminGrant } from "@/lib/db/admin-queries";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicationStatus = searchParams.get("publicationStatus") || undefined;
    const sector = searchParams.get("sector") || undefined;
    const search = searchParams.get("search") || undefined;

    const grants = await getAdminGrants({ publicationStatus, sector, search });
    return NextResponse.json({ grants });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch grants" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      schemeName,
      slug,
      agency,
      sector,
      stage,
      fundingRange,
      eligibility,
      applicationWindow,
      officialSourceUrl,
      sourceTitle,
      deadlineType,
      deadlineAt,
      publicationStatus,
      displayOrder,
      checklistItems,
    } = body;

    if (!schemeName || !slug || !agency || !sector || !officialSourceUrl) {
      return NextResponse.json(
        { error: "Missing required fields (schemeName, slug, agency, sector, officialSourceUrl)" },
        { status: 400 }
      );
    }

    const grant = await createAdminGrant(
      {
        schemeName,
        slug,
        agency,
        sector,
        stage: stage || "Ideation to Commercialization",
        fundingRange: fundingRange || "Grant-in-aid",
        eligibility: eligibility || "Registered student / startup",
        applicationWindow: applicationWindow || "Ongoing",
        officialSourceUrl,
        sourceTitle: sourceTitle || "Official Portal",
        deadlineType: deadlineType || "fixed_date",
        deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
        verifiedBy: admin.email,
        publicationStatus: publicationStatus || "Draft",
        displayOrder: displayOrder ? Number(displayOrder) : 0,
        checklistItems,
      },
      admin
    );

    return NextResponse.json({ success: true, grant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create grant" }, { status: 500 });
  }
}
