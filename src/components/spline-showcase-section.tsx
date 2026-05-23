"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { SplineScene } from "@/components/ui/splite";
import { useLang } from "@/components/language-context";

/* ──────────────────────────────────────────────────────────────────────────────
   SplineShowcaseSection
   - Dark "wow" section that sits BELOW the light hero.
   - Lazy-loads the Spline scene only when scrolled into view (IntersectionObserver)
     to protect hero LCP and keep the initial bundle small.
   - Marathi/English headline tied to PrintShubh land-document context.
   - TODO(scene): swap the placeholder URL with a Maharashtra/map-themed
     scene from spline.community when sourced.
   ────────────────────────────────────────────────────────────────────────────── */

/* Placeholder — replace with a Maharashtra/map-themed scene when available */
const SCENE_URL = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

const ui = {
  mr: {
    eyebrow: "इंटरॅक्टिव्ह 3D अनुभव",
    h1: "गाव नकाशा आणि जमीन कागदपत्रांचा",
    h2: "इंटरॅक्टिव्ह अनुभव",
    body: "PrintShubh वर तुमची विनंती सोपी होते — जिल्हा, तालुका, गाव निवडा आणि WhatsApp वर सहाय्य मिळवा. खालील 3D स्केन इंटरॅक्टिव्ह आहे, माउस फिरवून पहा.",
    cta: "WhatsApp वर सहाय्य घ्या",
    note: "टीप: हे केवळ डिझाइन डेमो आहे. अंतिम जमीन नोंदी अधिकृत पोर्टलवर पडताळाव्यात.",
    waMsg: "नमस्कार, मला जमीन कागदपत्र सेवेसाठी सहाय्य हवे आहे.",
  },
  en: {
    eyebrow: "Interactive 3D Experience",
    h1: "An interactive look at",
    h2: "village maps & land documents",
    body: "PrintShubh makes your request simple — pick district, taluka, village and get assistance on WhatsApp. The 3D scene below is interactive, move your mouse over it.",
    cta: "Get help on WhatsApp",
    note: "Note: this is a design demo. Final land records must be verified from official portals.",
    waMsg: "Hello, I need assistance with land document services.",
  },
} as const;

export function SplineShowcaseSection() {
  const { lang } = useLang();
  const t = ui[lang];

  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const waHref = `https://wa.me/918625801907?text=${encodeURIComponent(t.waMsg)}`;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="spline-showcase-heading"
      className="relative overflow-hidden bg-slate-950 px-5 py-16 sm:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <Card className="relative h-[460px] w-full overflow-hidden border-white/10 bg-black/[0.96] text-white shadow-2xl sm:h-[500px]">
          <Spotlight
            className="-top-40 left-0 md:-top-20 md:left-60"
            fill="white"
          />

          <div className="relative flex h-full flex-col lg:flex-row">
            {/* Left — copy + CTA */}
            <div className="relative z-10 flex flex-1 flex-col justify-center p-6 sm:p-8">
              <p className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200 backdrop-blur">
                <Sparkles className="size-3.5" />
                {t.eyebrow}
              </p>
              <h2
                id="spline-showcase-heading"
                className="mt-4 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-3xl font-black leading-tight text-transparent sm:text-4xl lg:text-5xl"
              >
                {t.h1}
                <br />
                {t.h2}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-neutral-300 sm:text-base">
                {t.body}
              </p>
              <a
                href={waHref}
                className="mt-6 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-green-700"
              >
                <MessageCircle className="size-4" />
                {t.cta}
              </a>
              <p className="mt-4 max-w-md text-[11px] leading-5 text-neutral-500">
                {t.note}
              </p>
            </div>

            {/* Right — Spline (lazy on viewport) */}
            <div className="relative flex-1">
              {inView ? (
                <SplineScene
                  scene={SCENE_URL}
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="loader" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
