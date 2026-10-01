import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { getAdminUsers, createAdminUser } from "@/lib/db/admin-queries";
import { prisma } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin user management requires Super Admin role" },
        { status: 403 }
      );
    }

    const users = await getAdminUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Forbidden: Creating admin accounts requires Super Admin role" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json({ error: "Missing required fields (email, name, password)" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An admin user with this email already exists" }, { status: 409 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === "super_admin" ? "super_admin" : "editor";

    const user = await createAdminUser(
      {
        email: normalizedEmail,
        name,
        passwordHash,
        role: userRole,
      },
      admin
    );

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
