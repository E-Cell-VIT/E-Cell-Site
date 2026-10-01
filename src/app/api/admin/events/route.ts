import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { logAdminAction } from "@/lib/db/audit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();

    const event = await prisma.event.create({
      data: {
        title: body.title,
        slug: body.slug,
        coverImageUrl: body.coverImageUrl || null,
        eventDate: new Date(body.eventDate),
        venue: body.venue,
        category: body.category,
        eventStatus: body.eventStatus || "Upcoming",
        publicationStatus: body.publicationStatus || "Draft",
        isFeatured: Boolean(body.isFeatured),
        description: body.description,
        reportPdfUrl: body.reportPdfUrl || null,
        registrationUrl: body.registrationUrl || null,
      },
    });

    await logAdminAction({
      adminUserId: admin.id,
      adminEmail: admin.email,
      action: "create",
      contentType: "Event",
      recordId: event.id,
      newValues: { title: event.title, slug: event.slug },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
