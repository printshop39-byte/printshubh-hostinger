/**
 * Admin email allowlist — pure helpers (no environment access, no secrets).
 *
 * The list itself comes from the server-only ADMIN_EMAILS variable, read in
 * src/app/admin/land-reports/auth.ts. This file only knows how to parse a raw
 * string and compare an email against a parsed list, so it is trivially
 * testable and contains nothing sensitive.
 *
 * Rules:
 *   - Emails are compared trimmed and lower-cased ("  Admin@Shop.com " == "admin@shop.com").
 *   - Separators: commas, semicolons, spaces or new lines. Surrounding quotes are ignored.
 *   - Anything that is not shaped like an email is dropped, never guessed at.
 *   - An empty list allows NOBODY (fail closed) — there is no "allow everyone" mode.
 */

const EMAIL_SHAPE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Normalise one address: trim, strip stray quotes, lower-case. */
export function normalizeEmail(input: unknown): string {
  return String(input ?? "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim()
    .toLowerCase();
}

/** "A@x.com, b@y.com ;  A@X.com" -> ["a@x.com", "b@y.com"] */
export function parseAdminEmails(raw: unknown): string[] {
  const out: string[] = [];
  for (const part of String(raw ?? "").split(/[,;\s]+/)) {
    const email = normalizeEmail(part);
    if (EMAIL_SHAPE.test(email) && !out.includes(email)) out.push(email);
  }
  return out;
}

/** True only if `email` is on a NON-EMPTY allowlist. */
export function isAllowedAdminEmail(email: unknown, allowlist: readonly string[]): boolean {
  if (allowlist.length === 0) return false; // fail closed
  const e = normalizeEmail(email);
  return EMAIL_SHAPE.test(e) && allowlist.includes(e);
}
