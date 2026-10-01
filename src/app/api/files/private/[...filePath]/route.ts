import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth/session";
import { getStorageFilePath } from "@/lib/storage";
import { prisma } from "@/lib/db/client";
import { logPitchDeckAccess } from "@/lib/db/admin-queries";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filePath: string[] }> }
) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    return new NextResponse("Unauthorized. Admin authentication required to access private files.", {
      status: 401,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const { filePath } = await context.params;
  if (!filePath || filePath.length === 0) {
    return new NextResponse("File path required", { status: 400 });
  }

  const relativePath = filePath.join("/");
  const fullPath = getStorageFilePath(relativePath, true);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return new NextResponse("Private file not found", { status: 404 });
  }

  // Find associated application to log access
  const application = await prisma.incubationApplication.findFirst({
    where: {
      pitchDeckPath: {
        endsWith: path.basename(fullPath),
      },
    },
    select: { id: true, pitchDeckFilename: true },
  });

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || undefined;

  if (application) {
    await logPitchDeckAccess(
      application.id,
      { id: admin.id, email: admin.email },
      { ipAddress: ip, userAgent }
    );
  }

  const fileBuffer = await fs.promises.readFile(fullPath);
  const downloadName = application?.pitchDeckFilename || path.basename(fullPath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${downloadName}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
