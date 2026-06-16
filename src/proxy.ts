import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin secret gate for /admin/* (Next 16 `proxy` convention — formerly
 * `middleware`). Runs server-side only; ADMIN_PANEL_SECRET is read from
 * process.env and never reaches the client bundle.
 *
 * Layered with the page-level ENABLE_ADMIN_BHUNAKSHA_OVERLAY flag (which still
 * 404s the route when the feature is off):
 *
 *   - ADMIN_PANEL_SECRET unset  → pass through; the page's feature flag is the
 *     only gate (preserves current flag-only behaviour for local/dev).
 *   - ADMIN_PANEL_SECRET set:
 *       • ?key=<secret>  → set a secure httpOnly cookie, then redirect to the
 *         clean URL (drops the secret from the address bar / history / referer).
 *       • valid cookie   → allow through to the page.
 *       • otherwise      → 404 (does not confirm the route exists; matches the
 *         noindex / not-in-sitemap posture).
 *
 * The cookie stores a SHA-256 token of the secret, not the secret itself.
 */

const COOKIE = "ps_admin_auth";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/** SHA-256 hex of the secret (Web Crypto — available in the proxy runtime). */
async function tokenFor(secret: string): Promise<string> {
  const data = new TextEncoder().encode("ps-admin:v1:" + secret);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-checked constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function notFound(): NextResponse {
  return new NextResponse("Not Found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
  });
}

export async function proxy(request: NextRequest) {
  const secret = process.env.ADMIN_PANEL_SECRET;
  // No secret configured → defer entirely to the page's feature-flag gate.
  if (!secret) return NextResponse.next();

  const token = await tokenFor(secret);
  const key = request.nextUrl.searchParams.get("key");
  const cookie = request.cookies.get(COOKIE)?.value;

  // Valid ?key= → mint cookie + redirect to a clean URL (no secret in history).
  if (key !== null && safeEqual(key, secret)) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("key");
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/admin",
      maxAge: MAX_AGE_SECONDS,
    });
    return res;
  }

  // Valid cookie → allow (the page still enforces the feature flag).
  if (cookie && safeEqual(cookie, token)) return NextResponse.next();

  // Unauthorized.
  return notFound();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
