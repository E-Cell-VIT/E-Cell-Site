import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { createSession } from "@/lib/auth/session";
import { logAdminAction } from "@/lib/db/audit";
import { checkRateLimit } from "@/lib/rate-limit";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    // Rate limiting: 10 login attempts per 10 mins per IP
    const rateLimit = await checkRateLimit({
      key: `admin_login_${ip}`,
      limit: 10,
      windowSeconds: 600,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 10 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid credentials." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
    });

    // Timing attack resistance: run comparison even if user not found
    if (!admin) {
      await bcrypt.compare(password, "$2a$12$e8Yy8/O0PsqBv4t9h6Z9EOMN3/o8yDqQ/fR.h4X4b4h8qJ3dF3Y0.");
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!admin.active) {
      return NextResponse.json(
        { error: "This administrator account has been deactivated. Contact a Super Admin." },
        { status: 403 }
      );
    }

    // Check account lockout
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json(
        { error: `Account is temporarily locked due to repeated failed attempts. Try again in ${remainingMinutes} minute(s).` },
        { status: 423 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatch) {
      const newAttempts = admin.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }

      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: newAttempts,
          lockedUntil,
        },
      });

      return NextResponse.json(
        {
          error: lockedUntil
            ? `Account locked for ${LOCKOUT_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} failed attempts.`
            : `Invalid email or password. Attempt ${newAttempts} of ${MAX_FAILED_ATTEMPTS}.`,
        },
        { status: 401 }
      );
    }

    // Reset failed attempts & set last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Create secure signed session cookie
    await createSession(admin.id, admin.email);

    // Audit log
    await logAdminAction({
      adminUserId: admin.id,
      adminEmail: admin.email,
      action: "status_change",
      contentType: "AdminSession",
      recordId: admin.id,
      ipAddress: ip,
      newValues: { event: "login_success" },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        mustChangePassword: admin.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
