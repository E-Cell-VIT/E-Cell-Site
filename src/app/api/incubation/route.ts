import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { saveFile } from "@/lib/storage";
import { checkRateLimit, validateBotProtection } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    // Rate limiting: 3 applications per hour per IP
    const rateLimit = await checkRateLimit({
      key: `incubation_submit_${ip}`,
      limit: 3,
      windowSeconds: 3600,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Submission rate limit reached. Please wait before submitting another application." },
        { status: 429 }
      );
    }

    const formData = await request.formData();

    const honeypot = formData.get("honeypot") as string | null;
    const formLoadedAtStr = formData.get("formLoadedAt") as string | null;
    const formLoadedAt = formLoadedAtStr ? parseInt(formLoadedAtStr, 10) : undefined;

    const botCheck = validateBotProtection({ honeypot: honeypot || undefined, formLoadedAt });
    if (botCheck.isBot) {
      return NextResponse.json({ error: botCheck.reason }, { status: 400 });
    }

    const startupName = (formData.get("startupName") as string)?.trim();
    const founderNames = (formData.get("founderNames") as string)?.trim();
    const founderEmail = (formData.get("founderEmail") as string)?.trim().toLowerCase();
    const founderPhone = (formData.get("founderPhone") as string)?.trim();
    const departmentBatch = (formData.get("departmentBatch") as string)?.trim();
    const domain = (formData.get("domain") as string)?.trim();
    const oneLineSummary = (formData.get("oneLineSummary") as string)?.trim();
    const stage = (formData.get("stage") as string)?.trim();
    const consentGiven = formData.get("consentGiven") === "true";

    if (
      !startupName ||
      !founderNames ||
      !founderEmail ||
      !founderPhone ||
      !departmentBatch ||
      !domain ||
      !oneLineSummary ||
      !stage
    ) {
      return NextResponse.json(
        { error: "All required fields must be filled." },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: "Consent to the Incubation Data Policy is required." },
        { status: 400 }
      );
    }

    // Process file upload (PDF pitch deck, max 10MB)
    const file = formData.get("pitchDeck") as File | null;
    let savedPitchDeckPath: string | null = null;
    let originalFilename: string | null = null;

    if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Pitch deck file size exceeds 10 MB limit." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      originalFilename = file.name;

      const saved = await saveFile({
        buffer,
        originalFilename,
        isPrivate: true,
        subfolder: "pitch_decks",
        maxSizeBytes: 10 * 1024 * 1024,
      });

      savedPitchDeckPath = saved.relativePath;
    }

    const application = await prisma.incubationApplication.create({
      data: {
        startupName,
        founderNames,
        founderEmail,
        founderPhone,
        departmentBatch,
        domain,
        oneLineSummary,
        stage,
        pitchDeckPath: savedPitchDeckPath,
        pitchDeckFilename: originalFilename,
        consentGiven: true,
        consentVersion: "v1.0-incubation",
        consentTimestamp: new Date(),
        status: "Pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Incubation application successfully submitted!",
      id: application.id,
    });
  } catch (error: unknown) {
    console.error("Incubation application error:", error);
    const message = error instanceof Error ? error.message : "Failed to process application.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
