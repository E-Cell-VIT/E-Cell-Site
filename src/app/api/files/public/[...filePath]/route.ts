import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getStorageFilePath } from "@/lib/storage";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filePath: string[] }> }
) {
  const { filePath } = await context.params;
  if (!filePath || filePath.length === 0) {
    return new NextResponse("File path required", { status: 400 });
  }

  const relativePath = filePath.join("/");
  const fullPath = getStorageFilePath(relativePath, false);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";

  const fileBuffer = await fs.promises.readFile(fullPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
