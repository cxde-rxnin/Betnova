import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { checkRateLimit } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // 1. Rate Limiting
  if (path.startsWith("/api/auth/callback/credentials") || path === "/login") {
    const allowed = checkRateLimit(ip, "LOGIN");
    if (!allowed) {
      return new NextResponse("Too Many Login Attempts", { status: 429 });
    }
  } else if (path.startsWith("/api/webhooks")) {
    const allowed = checkRateLimit(ip, "WEBHOOK");
    if (!allowed) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  } else if (path.startsWith("/api/")) {
    const allowed = checkRateLimit(ip, "API");
    if (!allowed) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // 2. Authentication — in v5, session is on req.auth
  const session = req.auth;
  const isLoggedIn = !!session;

  const isApiAuthRoute = path.startsWith("/api/auth");
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/admin/login");

  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/wallet") ||
    path.startsWith("/bets") ||
    path.startsWith("/profile") ||
    path.startsWith("/settings") ||
    path.startsWith("/notifications");

  const isAdminRoute = path.startsWith("/admin") && !path.startsWith("/admin/login");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    const role = session?.user?.role as string;
    if (role === "USER") {
      return NextResponse.redirect(new URL("/admin/login", nextUrl));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      let callbackUrl = path;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.).*)" ],
};
