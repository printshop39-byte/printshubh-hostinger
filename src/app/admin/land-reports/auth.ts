/**
 * Server-only access gate for the admin land-reports area.
 *
 * Backend-less by design: a single shared password (env `ADMIN_ACCESS_PASSWORD`)
 * gates entry. The cookie stores a SHA-256 of the password — never the raw value —
 * and is httpOnly, so it is not readable by client JS. This is a lightweight
 * "authorised users only" gate, NOT per-user subscription. Upgrade path: swap
 * `isAuthed()` / the login action for a real auth provider when a backend exists.
 */

import { cookies } from "next/headers";
import { createHash } from "crypto";

export const COOKIE_NAME = "psh_admin_access";

/** Error state shared between the login action and the login form. */
export type LoginState = { error?: string };

/** Hash a password the same way the cookie stores it. */
export function tokenFor(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

/**
 * The token a valid cookie must hold, or `null` when no password is configured
 * (gate stays closed — fail safe rather than fail open).
 */
export function expectedToken(): string | null {
  const pw = process.env.ADMIN_ACCESS_PASSWORD;
  return pw ? tokenFor(pw) : null;
}

/** True only when a password is configured AND the request cookie matches it. */
export async function isAuthed(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expected;
}
