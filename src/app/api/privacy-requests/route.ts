import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { checkRateLimit, validateBotProtection } from "@/lib/rate-limit";

const PrivacyRequestSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  requestType: z.enum(["Delete", "Correct", "Withdraw Consent", "Other"]),
  details: z.string().min(10, "Please provide sufficient detail for your request").max(3000),
  honeypot: z.string().optional(),
  formLoadedAt: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    const rateLimit = await checkRateLimit({
      key: `privacy_req_${ip}`,
      limit: 3,
      windowSeconds: 3600,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many privacy requests submitted. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const botCheck = validateBotProtection({
      honeypot: body.honeypot,
      formLoadedAt: body.formLoadedAt,
    });
    if (botCheck.isBot) {
      return NextResponse.json({ error: botCheck.reason }, { status: 400 });
    }

    const parsed = PrivacyRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const reqRecord = await prisma.privacyRequest.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        requestType: parsed.data.requestType,
        details: parsed.data.details,
        status: "New",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your privacy request has been logged. Our data team will review it according to our retention policy.",
      id: reqRecord.id,
    });
  } catch (error) {
    console.error("Privacy request error:", error);
    return NextResponse.json(
      { error: "Failed to submit privacy request." },
      { status: 500 }
    );
  }
}
