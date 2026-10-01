import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminCategories, createAdminCategory } from "@/lib/db/admin-queries";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;

    const categories = await getAdminCategories(type);
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug, type, displayOrder } = body;

    if (!name || !slug || !type) {
      return NextResponse.json({ error: "Missing required fields (name, slug, type)" }, { status: 400 });
    }

    const category = await createAdminCategory(
      {
        name,
        slug,
        type,
        displayOrder: displayOrder ? Number(displayOrder) : 0,
      },
      admin
    );

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
