import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { saveFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subfolder = (formData.get("subfolder") as string) || "logos";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validSubfolders = ["logos", "events", "team", "blogs", "reports"];
    if (!validSubfolders.includes(subfolder)) {
      return NextResponse.json({ error: "Invalid subfolder specified" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await saveFile({
      buffer,
      originalFilename: file.name,
      isPrivate: false,
      subfolder: subfolder as any,
    });

    return NextResponse.json({
      success: true,
      url: result.publicUrl,
      relativePath: result.relativePath,
      filename: result.filename,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
