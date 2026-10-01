import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { getAdminExportData } from "@/lib/db/admin-queries";

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return "";

  // Flatten nested objects if any (e.g. privateDetails or JSON fields)
  const flattened = data.map((item) => {
    const flat: Record<string, any> = {};
    for (const [k, v] of Object.entries(item)) {
      if (v === null || v === undefined) {
        flat[k] = "";
      } else if (typeof v === "object" && !(v instanceof Date)) {
        flat[k] = JSON.stringify(v);
      } else if (v instanceof Date) {
        flat[k] = v.toISOString();
      } else {
        flat[k] = v;
      }
    }
    return flat;
  });

  const headers = Object.keys(flattened[0]);
  const headerRow = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",");

  const rows = flattened.map((row) =>
    headers
      .map((header) => {
        const val = row[header] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headerRow, ...rows].join("\r\n");
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const format = searchParams.get("format") || "json"; // "csv" | "json"

    if (!type) {
      return NextResponse.json({ error: "Missing export type parameter" }, { status: 400 });
    }

    const data = await getAdminExportData(type);

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ecell-vit-${type}-${timestamp}.${format}`;

    if (format === "csv") {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
