"use server";

/**
 * Login / logout server actions for the admin land-reports gate.
 * Cookies can only be written from a Server Action or Route Handler (Next 16),
 * so the form posts here. On success we redirect so the page re-evaluates the
 * gate; on failure we return an error string for the form to show.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, tokenFor, type LoginState } from "./auth";

const TWELVE_HOURS = 60 * 60 * 12;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const configured = process.env.ADMIN_ACCESS_PASSWORD;
  if (!configured) return { error: "सर्व्हरवर access password सेट केलेला नाही (ADMIN_ACCESS_PASSWORD)." };

  const submitted = String(formData.get("password") ?? "");
  if (submitted !== configured) return { error: "चुकीचा पासवर्ड. पुन्हा प्रयत्न करा." };

  const store = await cookies();
  store.set(COOKIE_NAME, tokenFor(configured), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: TWELVE_HOURS,
  });
  // Re-run the page (now authed) instead of returning state.
  redirect("/admin/land-reports");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete({ name: COOKIE_NAME, path: "/admin" });
  redirect("/admin/land-reports");
}
