/**
 * Admin — client inquiries list (server component). Fetches the leads submitted
 * via the landing-page form (Supabase) and hands them to the interactive
 * <LeadsTable> for click-to-expand detail + one-click actions.
 */

import { listInquiries, inquiriesConfigured } from "@/lib/inquiries";
import { LeadsTable } from "./leads-table";

export async function AdminLeadsList() {
  if (!inquiriesConfigured()) {
    return (
      <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[13px] font-bold text-amber-800">
          ग्राहक चौकशी यादीसाठी Supabase कॉन्फिगर केलेला नाही.
        </p>
        <p className="mt-1 text-[12px] font-semibold text-amber-700">
          Server वर <code>SUPABASE_URL</code> + <code>SUPABASE_SERVICE_ROLE_KEY</code> सेट करा.
        </p>
      </section>
    );
  }

  const rows = await listInquiries();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-black text-slate-900">ग्राहक चौकशी</h2>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[12px] font-black text-blue-800">
          {rows.length}
        </span>
      </div>
      <LeadsTable rows={rows} />
    </section>
  );
}
