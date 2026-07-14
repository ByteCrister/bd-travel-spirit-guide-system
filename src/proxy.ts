// src/proxy.ts
// ─────────────────────────────────────────────────────────────────────────────
// Middleware: API rate limiting + auth guard + role-based access control
//
// Layer order (fast-fail first):
//   1. Static / public routes   → pass through immediately
//   2. /api/* (non-auth)        → rate-limit 100 req/60s per IP; 429 on breach
//   3. Protected pages          → require valid session; redirect to / on failure
//   4. Admin-only pages         → require guide/admin role; redirect to /dashboard?error=unauthorized
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options.auth";
import { authRateLimit } from "@/lib/upstash-redis/auth-rate-limit";
import { USER_ROLE } from "@/constants/current-user/user.const";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Max API requests per IP in the sliding window */
const API_RATE_LIMIT = 100;

/** Sliding-window length in seconds */
const API_RATE_WINDOW = 60;

/** Roles that are considered "admin-tier" and may access adminOnly routes */
const ADMIN_ROLES: string[] = [USER_ROLE.ADMIN, USER_ROLE.GUIDE];

// ─── Route Definitions ───────────────────────────────────────────────────────

/**
 * Prefixes that are publicly accessible without a session.
 * These bypass all auth + rate-limit checks.
 */
const PUBLIC_PREFIXES = [
  "/api/auth",   // NextAuth sign-in / sign-out / callback endpoints
  "/_next",      // Next.js runtime assets
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

/**
 * Page routes that require an authenticated session.
 * Any sub-path under these prefixes is protected.
 * Derived from navigationGroups in Sidebar.tsx.
 */
const PROTECTED_PAGE_PREFIXES = [
  "/dashboard",
  "/operations",
  "/support",
  "/users",
  "/settings",
];

/**
 * Page route prefixes that additionally require an admin-tier role.
 * Derived from navItems where adminOnly === true in Sidebar.tsx.
 */
const ADMIN_ONLY_PAGE_PREFIXES = [
  "/support/reset-password-requests",
  "/users/employees",
  "/settings/payment-accounts",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true when the pathname matches any of the given prefixes. */
function matchesAnyPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Extract the real client IP from common proxy headers.
 * Falls back to "unknown" so rate limiting still works (shared bucket).
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

/** Builds a JSON 429 Too Many Requests response. */
function rateLimitExceededResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please slow down and try again later.",
      retryAfter: API_RATE_WINDOW,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(API_RATE_WINDOW),
        "X-RateLimit-Limit": String(API_RATE_LIMIT),
        "X-RateLimit-Window": `${API_RATE_WINDOW}s`,
      },
    }
  );
}

/** Builds a redirect response to the sign-in page. */
function redirectToSignIn(request: NextRequest): NextResponse {
  const signInUrl = new URL("/", request.url);
  signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

/** Builds a redirect response to the dashboard with an unauthorized error. */
function redirectUnauthorized(request: NextRequest): NextResponse {
  const dashboardUrl = new URL("/dashboard", request.url);
  dashboardUrl.searchParams.set("error", "unauthorized");
  return NextResponse.redirect(dashboardUrl);
}

// ─── Main Proxy Handler ───────────────────────────────────────────────────────

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ── Layer 1: Public / static routes ────────────────────────────────────────
  // Root sign-in page and all public prefixes pass through immediately.
  if (pathname === "/" || matchesAnyPrefix(pathname, PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  // ── Layer 2: API rate limiting ──────────────────────────────────────────────
  // All /api/* routes (excluding /api/auth/* which was already passed through)
  // are rate-limited per client IP to prevent abuse.
  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);

    // Use a dedicated namespace so API limits don't collide with auth limits
    const allowed = await authRateLimit({
      identifier: `ip:${ip}`,
      limit: API_RATE_LIMIT,
      window: API_RATE_WINDOW,
    });

    if (!allowed) {
      return rateLimitExceededResponse();
    }

    // Within rate limit — allow API request to proceed
    return NextResponse.next();
  }

  // ── Layer 3: Authentication guard (protected pages) ─────────────────────────
  // Only evaluate protected page prefixes; anything else is passed through.
  if (matchesAnyPrefix(pathname, PROTECTED_PAGE_PREFIXES)) {
    // NextAuth v5: auth() returns the session or null when called in middleware
    const session = await auth();

    if (!session || !session.user) {
      // No valid session → redirect to sign-in page
      return redirectToSignIn(request);
    }

    // ── Layer 4: Role-based access control (admin-only pages) ─────────────────
    if (matchesAnyPrefix(pathname, ADMIN_ONLY_PAGE_PREFIXES)) {
      const userRole = (session.user as { role?: string }).role ?? "";

      if (!ADMIN_ROLES.includes(userRole)) {
        // Authenticated but insufficient role → redirect to dashboard
        return redirectUnauthorized(request);
      }
    }

    // Authenticated (and role satisfied) — proceed
    return NextResponse.next();
  }

  // ── Default: pass all other requests through ──────────────────────────────
  return NextResponse.next();
}

// ─── Matcher Config ──────────────────────────────────────────────────────────
// Exclude Next.js internals and image-optimization from middleware processing
// to keep cold-start overhead minimal.
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static bundle files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico, robots.txt, sitemap.xml (public files)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};