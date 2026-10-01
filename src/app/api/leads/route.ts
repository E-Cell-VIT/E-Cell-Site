import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { checkRateLimit, validateBotProtection } from "@/lib/rate-limit";

const LeadSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(["Student", "Mentor", "Investor", "Sponsor", "Alumni", "Other"]),
  areaOfInterest: z.string().min(2, "Please specify your interest or department").max(120),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
  source: z.enum(["connect_modal", "contact_form"]).default("connect_modal"),
  consentGiven: z.boolean().refine((val) => val === true, "You must consent to data processing"),
  // Anti-spam fields
  honeypot: z.string().optional(),
  formLoadedAt: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    // 1. Rate limiting: Max 5 submissions per 10 minutes per IP
    const rateLimit = await checkRateLimit({
      key: `lead_submit_${ip}`,
      limit: 5,
      windowSeconds: 600,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 2. Anti-spam bot protection
    const botCheck = validateBotProtection({
      honeypot: body.honeypot,
      formLoadedAt: body.formLoadedAt,
    });
    if (botCheck.isBot) {
      return NextResponse.json({ error: botCheck.reason }, { status: 400 });
    }

    // 3. Validation
    const parsed = LeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { fullName, email, phone, role, areaOfInterest, message, source } = parsed.data;

    // 4. Save to SQLite database
    const lead = await prisma.lead.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        role,
        areaOfInterest,
        message,
        source,
        status: "Active",
        isRead: false,
        consentGiven: true,
        consentVersion: "v1.0-contact",
        consentTimestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for connecting with E-Cell VIT! We will be in touch shortly.",
      id: lead.id,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Internal server error while processing your inquiry." },
      { status: 500 }
    );
  }
}
