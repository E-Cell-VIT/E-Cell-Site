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
    const source = searchParams.get("source");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (source && source !== "all") where.source = source;

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Lead ID",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Area of Interest",
      "Source",
      "Status",
      "Read",
      "Consent Given",
      "Created At",
      "Message",
      "Internal Notes",
    ];

    const rows = leads.map((lead) => [
      escapeCsv(lead.id),
      escapeCsv(lead.fullName),
      escapeCsv(lead.email),
      escapeCsv(lead.phone || ""),
      escapeCsv(lead.role),
      escapeCsv(lead.areaOfInterest),
      escapeCsv(lead.source),
      escapeCsv(lead.status),
      escapeCsv(lead.isRead ? "Yes" : "No"),
      escapeCsv(lead.consentGiven ? "Yes" : "No"),
      escapeCsv(new Date(lead.createdAt).toISOString()),
      escapeCsv(lead.message),
      escapeCsv(lead.internalNotes || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const filename = `vit-ecell-leads-${new Date().toISOString().slice(0, 10)}.csv`;

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
