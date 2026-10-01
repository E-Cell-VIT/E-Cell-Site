import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "../db/client";

const COOKIE_NAME = "ecell_admin_session";
const SESSION_EXPIRY = "7d"; // 7 days
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback_default_secret_at_least_32_characters_long_for_security"
);

export interface SessionPayload {
  adminId: string;
  email: string;
}

export async function createSession(adminId: string, email: string): Promise<string> {
  const token = await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });

  return token;
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload.adminId || typeof payload.adminId !== "string") {
      return null;
    }

    return {
      adminId: payload.adminId,
      email: (payload.email as string) || "",
    };
  } catch {
    return null;
  }
}

/**
 * Validates session, checks DB for active status, and fetches current role from DB.
 * Never trusts the token's role claims.
 */
export async function requireAdmin(requiredRole?: "super_admin" | "editor") {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      mustChangePassword: true,
      lockedUntil: true,
    },
  });

  if (!admin || !admin.active) {
    throw new Error("UNAUTHORIZED");
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    throw new Error("ACCOUNT_LOCKED");
  }

  if (requiredRole && requiredRole === "super_admin" && admin.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  return admin;
}

export async function getAdminSession() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

