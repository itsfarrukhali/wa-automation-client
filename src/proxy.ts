// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_HINT_COOKIE_NAME } from "@/lib/session-cookie";

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const VERIFY_PAGE = "/verify-email";
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/settings",
  "/bookings",
  "/customers",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hint = request.cookies.get(SESSION_HINT_COOKIE_NAME)?.value ?? null;
  const isLoggedIn = hint === "verified" || hint === "unverified";
  const isVerified = hint === "verified";

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isVerifyPage = pathname.startsWith(VERIFY_PAGE);
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Logged-in users shouldn't see login/signup/forgot-password
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Verified users shouldn't sit on the verify-email screen
  if (isVerifyPage && isVerified) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Anonymous users can't reach protected app routes
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged-in-but-unverified users can't reach protected app routes either —
  // bounce to verify-email instead of letting the backend 403 on every call
  if (isProtected && isLoggedIn && !isVerified) {
    return NextResponse.redirect(new URL("/verify-email", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on all paths except static assets, images, and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico)$).*)",
  ],
};
