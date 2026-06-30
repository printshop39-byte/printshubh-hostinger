import { NextResponse } from "next/server";
import { insertInquiry } from "@/lib/inquiries";
import { notifyNewInquiry } from "@/lib/notify-inquiry";

/**
 * Public endpoint the landing-page inquiry form posts to. Validates, applies a
 * best-effort spam guard (honeypot + per-IP rate limit), then stores the lead
 * in Supabase. Node runtime + force-dynamic: runs per request, never cached.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort in-memory limiter (per warm serverless instance). Not bulletproof
// across instances, but enough to blunt naive form spam.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const WINDOW = 60_000;
  const MAX = 5;
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot: bots fill the hidden "company" field; humans never see it.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }); // silently accept + drop
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.customer_name);
  const mobile = str(body.mobile).replace(/\D/g, "");
  if (!name || mobile.length < 10) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const payload = {
    customer_name: name.slice(0, 120),
    mobile: mobile.slice(0, 15),
    service: str(body.service).slice(0, 80) || undefined,
    district: str(body.district).slice(0, 80) || undefined,
    taluka: str(body.taluka).slice(0, 80) || undefined,
    village: str(body.village).slice(0, 80) || undefined,
    gat: str(body.gat).slice(0, 80) || undefined,
    note: str(body.note).slice(0, 1000) || undefined,
  };

  const result = await insertInquiry(payload);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  // Best-effort owner alert — inert until Resend env is set; never throws, so
  // a failed email can't lose the lead (already saved above).
  await notifyNewInquiry(payload);

  return NextResponse.json({ ok: true });
}
