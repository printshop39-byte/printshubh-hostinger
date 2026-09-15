"use client";

/**
 * ServicePillars — the four things PrintShubh does, given equal weight.
 *
 * This is the section that fixes the old homepage's biggest problem: land
 * documents used to be the entire story. Here they are one card of four,
 * sitting alongside printing, photo and digital work, so the shop reads as
 * a shop.
 *
 * Hover choreography (desktop only, and only when motion is welcome):
 * the card lifts, its shadow deepens, the border picks up the brand blue,
 * the icon nudges up and the arrow slides right. No rotation, no spin —
 * the brief explicitly rules those out, and they make a service list
 * harder to read, not easier.
 */

import Link from "next/link";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { SERVICE_GROUPS } from "@/lib/shop-services";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent } from "@/lib/analytics";
import { Reveal, Stagger, StaggerItem } from "@/components/shop/motion";
import { SERVICE_ICONS } from "@/components/shop/service-icons";
import { ServiceMotionVisual } from "@/components/shop/service-motion-visual";

const t: Record<Lang, { heading: string; sub: string; ask: string }> = {
  mr: {
    heading: "तुमचे काम — आमची सेवा",
    sub: "PrintShubh मध्ये रोजच्या प्रिंटिंगपासून डिजिटल कागदपत्रांपर्यंत आवश्यक सेवा उपलब्ध.",
    ask: "WhatsApp वर विचारा",
  },
  en: {
    heading: "Your work, our counter",
    sub: "Everything from an everyday photocopy to a digital land document, under one roof.",
    ask: "Ask on WhatsApp",
  },
};

export function ServicePillars() {
  const { lang } = useLang();
  const tx = t[lang];

  return (
    <section
      id="services"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-white px-5 py-16 sm:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-blue-700">
            {lang === "mr" ? "एका ठिकाणी सर्व सेवा" : "Everything in one place"}
          </p>
          <h2 className="max-w-3xl text-3xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">
            {tx.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {tx.sub}
          </p>
        </Reveal>

        <Stagger
          as="ul"
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SERVICE_GROUPS.map((group, index) => {
            const waHref = buildWhatsAppUrl({
              message: group.whatsapp[lang],
              campaign: "service-pillars",
              content: group.key,
            });
            const Icon = SERVICE_ICONS[group.iconKey];

            return (
              <StaggerItem as="li" key={group.key}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,.4)] transition duration-300 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-cyan-400 before:to-amber-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-[0_28px_60px_-28px_rgba(29,78,216,.5)] motion-reduce:transform-none motion-reduce:transition-none">
                  <ServiceMotionVisual service={group.key} />
                  <div className="flex items-start justify-between">
                    <span className="-mt-5 ml-3 grid size-14 place-items-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-50 to-white p-1.5 shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 motion-reduce:transform-none">
                      <Icon className="h-full w-full" />
                    </span>
                    <span className="mt-3 text-[11px] font-black tracking-[0.2em] text-slate-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-black leading-tight text-slate-950">
                    {group.title[lang]}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-6 text-slate-600">
                    {group.blurb[lang]}
                  </p>

                  <ul className="mt-5 flex-1 space-y-2">
                    {group.items.map((item) => (
                      <li
                        key={item.label.en}
                        className="flex items-start gap-2 text-[14px] font-semibold leading-6 text-slate-700"
                      >
                        <Check
                          className="mt-1 size-3.5 shrink-0 text-green-600"
                          aria-hidden="true"
                        />
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="inline-block py-1 underline-offset-4 transition hover:text-blue-700 hover:underline"
                          >
                            {item.label[lang]}
                          </Link>
                        ) : (
                          item.label[lang]
                        )}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={group.href}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-700"
                    >
                      {group.cta[lang]}
                      <ArrowRight
                        className="size-4 transition duration-300 group-hover:translate-x-1 motion-reduce:transform-none"
                        aria-hidden="true"
                      />
                    </Link>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackWhatsAppLead();
                        trackFunnelEvent("service_whatsapp_click", {
                          lang,
                          surface: "service-pillars",
                          service_key: group.key,
                        });
                      }}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-bold text-green-800 transition hover:border-green-300 hover:bg-green-100"
                    >
                      <MessageCircle className="size-3.5" aria-hidden="true" />
                      {tx.ask}
                    </a>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
