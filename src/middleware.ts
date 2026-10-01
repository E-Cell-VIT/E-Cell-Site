import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "ecell_admin_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "fallback_default_secret_at_least_32_characters_long_for_security"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add noindex headers to private and admin paths
  const response = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/files/private")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  // Admin route protection (except login page and auth API)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (!payload.adminId) {
        throw new Error("Invalid session");
      }
    } catch {
      // Invalid or expired token
      const loginUrl = new URL("/admin/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.cookies.delete(COOKIE_NAME);
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/files/private/:path*"],
};
