import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;

    const applications = await prisma.incubationApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Application ID",
      "Startup Name",
      "Founder Names",
      "Founder Email",
      "Founder Phone",
      "Department & Batch",
      "Domain",
      "Stage",
      "Status",
      "Pitch Deck Attached",
      "Submission Date",
      "One-Line Summary",
      "Internal Notes",
    ];

    const rows = applications.map((app) => [
      escapeCsv(app.id),
      escapeCsv(app.startupName),
      escapeCsv(app.founderNames),
      escapeCsv(app.founderEmail),
      escapeCsv(app.founderPhone),
      escapeCsv(app.departmentBatch),
      escapeCsv(app.domain),
      escapeCsv(app.stage),
      escapeCsv(app.status),
      escapeCsv(app.pitchDeckPath ? "Yes" : "No"),
      escapeCsv(new Date(app.createdAt).toISOString()),
      escapeCsv(app.oneLineSummary),
      escapeCsv(app.internalNotes || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const filename = `vit-ecell-incubation-applications-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }
}
