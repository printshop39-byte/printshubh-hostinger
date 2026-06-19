/**
 * Admin — client inquiries list (server component). Reads the leads a client
 * submitted via the public landing-page form (stored in Supabase) and shows
 * them newest-first, each with a one-click WhatsApp reply to the client.
 */

import { listInquiries, inquiriesConfigured, type Inquiry } from "@/lib/inquiries";

/** wa.me link to the CLIENT's number with a greeting prefilled. */
function clientWhatsApp(i: Inquiry): string {
  const digits = i.mobile.replace(/\D/g, "");
  const intl = digits.length === 10 ? `91${digits}` : digits;
  const msg = `नमस्कार ${i.customer_name}, PrintShubh कडून संपर्क. आपल्या "${i.service ?? "जमीन सेवा"}" चौकशीबद्दल बोलूया.`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;
}

function placeOf(i: Inquiry): string {
  return [i.village, i.taluka, i.district].filter(Boolean).join(", ") || "—";
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export async function AdminLeadsList() {
  if (!inquiriesConfigured()) {
    return (
      <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
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
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-black text-slate-900">ग्राहक चौकशी</h2>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[12px] font-black text-blue-800">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md bg-slate-50 px-3 py-6 text-center text-[13px] font-semibold text-slate-500">
          अजून एकही चौकशी आलेली नाही.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-3 font-bold">वेळ</th>
                <th className="py-2 pr-3 font-bold">नाव</th>
                <th className="py-2 pr-3 font-bold">मोबाइल</th>
                <th className="py-2 pr-3 font-bold">सेवा</th>
                <th className="py-2 pr-3 font-bold">स्थान</th>
                <th className="py-2 pr-3 font-bold">टीप</th>
                <th className="py-2 pr-3 font-bold">कृती</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id} className="border-b border-slate-100 align-top">
                  <td className="whitespace-nowrap py-2 pr-3 text-slate-500">{fmtTime(i.created_at)}</td>
                  <td className="py-2 pr-3 font-bold text-slate-800">{i.customer_name}</td>
                  <td className="whitespace-nowrap py-2 pr-3 text-slate-700">{i.mobile}</td>
                  <td className="py-2 pr-3 text-slate-700">{i.service ?? "—"}</td>
                  <td className="py-2 pr-3 text-slate-700">{placeOf(i)}</td>
                  <td className="max-w-[200px] py-2 pr-3 text-slate-500">{i.note ?? "—"}</td>
                  <td className="py-2 pr-3">
                    <a
                      href={clientWhatsApp(i)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-green-700"
                    >
                      WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
