import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminBlogs, createAdminBlog } from "@/lib/db/admin-queries";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const publicationStatus = searchParams.get("publicationStatus") || undefined;
    const search = searchParams.get("search") || undefined;

    const blogs = await getAdminBlogs({ publicationStatus, search });
    return NextResponse.json({ blogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, coverImageUrl, excerpt, content, authorName, authorRole, authorBio, tags, readTimeMinutes, publicationStatus, isFeatured } = body;

    if (!title || !slug || !excerpt || !content || !authorName) {
      return NextResponse.json({ error: "Missing required fields (title, slug, excerpt, content, authorName)" }, { status: 400 });
    }

    const blog = await createAdminBlog(
      {
        title,
        slug,
        coverImageUrl: coverImageUrl || null,
        excerpt,
        content,
        authorName,
        authorRole: authorRole || null,
        authorBio: authorBio || null,
        tags: tags || "Entrepreneurship",
        readTimeMinutes: readTimeMinutes ? Number(readTimeMinutes) : undefined,
        publicationStatus: publicationStatus || "Draft",
        isFeatured: Boolean(isFeatured),
      },
      admin
    );

    return NextResponse.json({ success: true, blog });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create blog" }, { status: 500 });
  }
}
