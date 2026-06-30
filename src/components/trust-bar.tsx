"use client";

/**
 * TrustBar — a compact strip of trust signals shown on the homepage.
 *
 * IMPORTANT — no fabricated metrics. Every default item below is a claim
 * the site already makes elsewhere (30 years' experience in the hero;
 * same-day delivery + UPI payment on the FAQ page; statewide coverage).
 *
 * `ordersCompleted` and `customerRating` are intentionally `null`. They
 * render ONLY when you set real values — fill them in once you have an
 * actual cumulative order count and an average rating (e.g. from your
 * Google Business Profile). Until then the strip simply omits them, so
 * nothing unverified ever goes live.
 */

import {
  Award,
  Clock,
  MapPinned,
  ShieldCheck,
  Star,
  ThumbsUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

/* ── Fill these in with REAL numbers to surface them (else leave null) ── */
const ordersCompleted: number | null = null; // e.g. 5000  → "5,000+ अहवाल पूर्ण"
const customerRating: number | null = null;   // e.g. 4.8   → "4.8★ सरासरी रेटिंग"

interface Stat {
  icon: LucideIcon;
  value: Record<Lang, string>;
  label: Record<Lang, string>;
}

const baseStats: Stat[] = [
  {
    icon: Award,
    value: { mr: "३०+", en: "30+" },
    label: { mr: "वर्षांचा अनुभव", en: "years of experience" },
  },
  {
    icon: MapPinned,
    value: { mr: "महाराष्ट्रभर", en: "All Maharashtra" },
    label: { mr: "डिजिटल सेवा", en: "digital service" },
  },
  {
    icon: Clock,
    value: { mr: "त्याच दिवशी", en: "Same day" },
    label: { mr: "बहुतेक सेवा", en: "most services" },
  },
  {
    icon: ShieldCheck,
    value: { mr: "सुरक्षित UPI", en: "Secure UPI" },
    label: { mr: "पेमेंट", en: "payment" },
  },
];

function buildStats(): Stat[] {
  const stats = [...baseStats];
  if (ordersCompleted != null) {
    stats.splice(1, 0, {
      icon: ThumbsUp,
      value: {
        mr: `${ordersCompleted.toLocaleString("en-IN")}+`,
        en: `${ordersCompleted.toLocaleString("en-IN")}+`,
      },
      label: { mr: "अहवाल पूर्ण", en: "reports completed" },
    });
  }
  if (customerRating != null) {
    stats.push({
      icon: Star,
      value: { mr: `${customerRating}★`, en: `${customerRating}★` },
      label: { mr: "सरासरी रेटिंग", en: "average rating" },
    });
  }
  return stats;
}

const heading: Record<Lang, string> = {
  mr: "महाराष्ट्रासाठी विश्वासार्ह जमीन-कागदपत्र सहाय्य",
  en: "Trusted land-document assistance for Maharashtra",
};

export function TrustBar() {
  const { lang } = useLang();
  const stats = buildStats();

  return (
    <section className="border-y border-slate-200 bg-white px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="sr-only">{heading[lang]}</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                data-reveal
                key={s.label.en}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-[#f8fbff] px-4 py-3.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-base font-black leading-tight text-slate-950">
                    {s.value[lang]}
                  </dt>
                  <dd className="text-xs font-semibold leading-snug text-slate-600">
                    {s.label[lang]}
                  </dd>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
