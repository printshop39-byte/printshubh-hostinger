"use server";

/**
 * Login / logout server actions for the admin land-reports gate, plus the
 * lead-mutation actions. Auth is Supabase (email + password).
 *
 * signInWithPassword/signOut write the session cookies through the @supabase/ssr
 * cookie adapter — that only persists from a Server Action / Route Handler
 * (Next 16), which is exactly where these run.
 */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSupabaseServerClient,
  supabaseAuthConfigured,
} from "@/lib/supabase/server";
import { isAuthed, type LoginState } from "./auth";
import { deleteInquiry, updateInquiryStatus } from "@/lib/inquiries";
import { asStatus } from "@/lib/inquiry-status";

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!supabaseAuthConfigured()) {
    return {
      error:
        "सर्व्हरवर Supabase Auth सेट केलेले नाही (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "ईमेल व पासवर्ड दोन्ही आवश्यक आहेत." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Deliberately generic message — don't reveal whether the email exists.
  if (error) return { error: "चुकीचा ईमेल किंवा पासवर्ड." };

  // Session cookie is now set; re-run the page (now authed).
  redirect("/admin/land-reports");
}

export async function logoutAction(): Promise<void> {
  if (supabaseAuthConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/land-reports");
}

/** Set a lead's status. Admin-gated; refreshes the list on success. */
export async function setLeadStatus(id: string, status: string): Promise<void> {
  if (!(await isAuthed())) return;
  await updateInquiryStatus(id, asStatus(status));
  revalidatePath("/admin/land-reports");
}

/** Delete a lead. Admin-gated; refreshes the list on success. */
export async function removeLead(id: string): Promise<void> {
  if (!(await isAuthed())) return;
  await deleteInquiry(id);
  revalidatePath("/admin/land-reports");
}
