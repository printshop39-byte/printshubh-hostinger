/**
 * GET /auth/callback — landing point of the password-recovery email link.
 *
 * Two link shapes are supported (both end on the same reset page):
 *   1. ?token_hash=…&type=recovery  — the recommended SSR email template
 *      (works in any browser/device; no PKCE verifier cookie needed).
 *   2. ?code=…                      — the PKCE link produced when the request
 *      was made from our own /auth/forgot-password form (needs the same browser).
 *
 * Security rules:
 *   - Only `type=recovery` is accepted. Other OTP types (signup, magiclink,
 *     invite, email_change) can never establish a session through this route.
 *   - The user must pass the same admin rule as the admin gate (confirmed email
 *     on ADMIN_EMAILS); anyone else is signed straight back out.
 *   - The destination is FIXED (/auth/reset-password). There is no `next` /
 *     redirect parameter, so this cannot be used as an open redirect.
 *   - Tokens are consumed here on the server and never put in a page URL.
 *   - Failures (expired / used / invalid) go to the reset page's error state —
 *     never to the homepage.
 *
 * A short-lived httpOnly cookie marks "this browser just came through a
 * recovery link"; the reset form refuses to change a password without it, so
 * an ordinary signed-in session cannot be used to reset the password.
 */

import { NextResponse, type NextRequest } from "next/server";
import { isAllowedAdminUser } from "@/app/admin/land-reports/auth";
import {
  RECOVERY_COOKIE,
  RECOVERY_MAX_AGE_SECONDS,
  recoveryErrorFor,
  type RecoveryError,
} from "@/lib/auth-recovery";
import { createSupabaseServerClient, supabaseAuthConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function resetPageRedirect(request: NextRequest, error?: RecoveryError): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/reset-password";
  url.search = "";
  url.hash = "";
  if (error) url.searchParams.set("error", error);
  const res = NextResponse.redirect(url);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(request: NextRequest) {
  if (!supabaseAuthConfigured()) return resetPageRedirect(request, "invalid");

  const params = request.nextUrl.searchParams;

  // Supabase reports a bad/expired link as ?error=…&error_code=otp_expired.
  if (params.has("error") || params.has("error_code")) {
    return resetPageRedirect(request, recoveryErrorFor(params.get("error_code")));
  }

  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  const supabase = await createSupabaseServerClient();

  let user: Parameters<typeof isAllowedAdminUser>[0] = null;

  if (tokenHash) {
    if (params.get("type") !== "recovery") return resetPageRedirect(request, "invalid");
    const { data, error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
    if (error || !data.session) return resetPageRedirect(request, recoveryErrorFor(error?.code));
    user = data.user;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session) return resetPageRedirect(request, recoveryErrorFor(error?.code));
    user = data.user;
  } else {
    // No code at all. Implicit-flow errors arrive in the URL FRAGMENT, which a
    // server cannot see; the redirect keeps the fragment and the reset page's
    // client script reads it.
    return resetPageRedirect(request, "missing");
  }

  // Same rule as the admin gate: confirmed email on the ADMIN_EMAILS allowlist.
  if (!isAllowedAdminUser(user)) {
    await supabase.auth.signOut({ scope: "local" });
    return resetPageRedirect(request, "denied");
  }

  const res = resetPageRedirect(request);
  res.cookies.set(RECOVERY_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
    maxAge: RECOVERY_MAX_AGE_SECONDS,
  });
  return res;
}
