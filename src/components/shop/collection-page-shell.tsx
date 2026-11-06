"use client";

/**
 * CollectionPageShell — shared scaffolding for the 7 /collections/<slug>/
 * routes. Each route's page.tsx (server component) emits its own
 * <ServiceJsonLd /> (Service type — see the file header on collections.ts
 * for why not Product) and metadata, then renders <CollectionPageShell />.
 *
 * ENQUIRY-ONLY, NO PRICES (owner decision): every CTA here opens WhatsApp
 * with a pre-filled message; nothing on this page states or implies a
 * figure. Do not add a price without the same confirmed-pricing bar the
 * land-document services use (src/lib/pricing-data.ts, ASK_PRICE).
 */

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ChevronRight, Home, MessageCircle, Ruler } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppSupportButton } from "@/components/whatsapp-support-button";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { trackFunnelEvent, useFunnelViewEvent } from "@/lib/analytics";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { COLLECTIONS, hasCollectionPhotos, type Collection } from "@/lib/collections";
import { CollectionVisual } from "@/components/shop/collection-visual";
import { Reveal, Stagger, StaggerItem } from "@/components/shop/motion";

const t: Record<
  Lang,
  {
    home: string;
    collections: string;
    eyebrow: string;
    appsHeading: string;
    materialHeading: string;
    galleryHeading: string;
    customSizeHeading: string;
    customSizeBody: string;
    ctaAsk: string;
    ctaCustomSize: string;
    relatedHeading: string;
    note: string;
    formHeading: string;
    formBody: string;
    nameLabel: string;
    namePlaceholder: string;
    mobileLabel: string;
    mobilePlaceholder: string;
    collectionLabel: string;
    widthLabel: string;
    heightLabel: string;
    unitLabel: string;
    unitFeet: string;
    unitInch: string;
    unitCm: string;
    qtyLabel: string;
    materialLabel: string;
    materialPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    previewLabel: string;
    nameRequiredNote: string;
    sendCta: string;
  }
> = {
  mr: {
    home: "मुख्यपृष्ठ",
    collections: "Collections",
    eyebrow: "Premium Collection",
    appsHeading: "कुठे वापरले जाते",
    materialHeading: "मटेरियल माहिती",
    galleryHeading: "नमुने",
    customSizeHeading: "सानुकूल आकार हवा आहे?",
    customSizeBody: "तुमचे माप WhatsApp वर पाठवा — किंमत आणि उपलब्धता कळवली जाईल.",
    ctaAsk: "Get Quote / WhatsApp Enquiry",
    ctaCustomSize: "सानुकूल आकारासाठी विचारा",
    relatedHeading: "इतर Collections",
    note: "किंमत मागणीनुसार कळवली जाते — इथे कोणतीही किंमत अंदाजाने दाखवलेली नाही.",
    formHeading: "Quick Enquiry Form",
    formBody: "खालील माहिती भरा — WhatsApp वर पाठवण्यापूर्वी मजकूर इथे दिसेल. नाव वगळता सर्व माहिती ऐच्छिक आहे.",
    nameLabel: "नाव",
    namePlaceholder: "तुमचे नाव",
    mobileLabel: "मोबाईल नंबर (ऐच्छिक)",
    mobilePlaceholder: "10-अंकी मोबाईल नंबर",
    collectionLabel: "Collection",
    widthLabel: "रुंदी (ऐच्छिक)",
    heightLabel: "उंची (ऐच्छिक)",
    unitLabel: "एकक",
    unitFeet: "फूट",
    unitInch: "इंच",
    unitCm: "सेमी",
    qtyLabel: "प्रमाण",
    materialLabel: "Material / Finish (ऐच्छिक)",
    materialPlaceholder: "निवडा",
    notesLabel: "अतिरिक्त सूचना (ऐच्छिक)",
    notesPlaceholder: "डिझाइन, रंग किंवा इतर तपशील",
    previewLabel: "WhatsApp Message Preview",
    nameRequiredNote: "WhatsApp वर पाठवण्यासाठी नाव भरणे आवश्यक आहे.",
    sendCta: "WhatsApp वर पाठवा",
  },
  en: {
    home: "Home",
    collections: "Collections",
    eyebrow: "Premium Collection",
    appsHeading: "Where it's used",
    materialHeading: "Material information",
    galleryHeading: "Samples",
    customSizeHeading: "Need a custom size?",
    customSizeBody: "Send your measurements on WhatsApp — price and availability will be confirmed.",
    ctaAsk: "Get Quote / WhatsApp Enquiry",
    ctaCustomSize: "Ask about a custom size",
    relatedHeading: "Other collections",
    note: "Pricing is shared on request — no figure on this page is an estimate.",
    formHeading: "Quick Enquiry Form",
    formBody: "Fill in what you can — the WhatsApp message is shown below before you send it. Only your name is required.",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    mobileLabel: "Mobile number (optional)",
    mobilePlaceholder: "10-digit mobile number",
    collectionLabel: "Collection",
    widthLabel: "Width (optional)",
    heightLabel: "Height (optional)",
    unitLabel: "Unit",
    unitFeet: "Feet",
    unitInch: "Inch",
    unitCm: "CM",
    qtyLabel: "Quantity",
    materialLabel: "Material / Finish (optional)",
    materialPlaceholder: "Select",
    notesLabel: "Additional instructions (optional)",
    notesPlaceholder: "Design, colour or other details",
    previewLabel: "WhatsApp Message Preview",
    nameRequiredNote: "Name is required before sending on WhatsApp.",
    sendCta: "Send on WhatsApp",
  },
};

export function CollectionPageShell({ collection }: { collection: Collection }) {
  const { lang } = useLang();
  const tx = t[lang];

  const sectionRef = useRef<HTMLElement>(null);
  useFunnelViewEvent(sectionRef, "collection_page_view", {
    lang,
    surface: "collection-page",
    service_key: collection.key,
  });

  const waHref = buildWhatsAppUrl({
    message: collection.whatsappMessage[lang],
    campaign: collection.slug,
    content: "enquiry",
  });
  const waHrefCustomSize = buildWhatsAppUrl({
    message: collection.customSizeMessage[lang],
    campaign: collection.slug,
    content: "custom-size",
  });

  const related = COLLECTIONS.filter((c) => c.key !== collection.key).slice(0, 3);

  /* Stage-3 inline enquiry form — client-side only, no backend/API/price.
   * Every field but name is optional; empty fields are dropped entirely
   * from the composed WhatsApp message (owner-confirmed spec). */
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formWidth, setFormWidth] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formUnit, setFormUnit] = useState<"feet" | "inch" | "cm">("feet");
  const [formQty, setFormQty] = useState("1");
  const [formMaterial, setFormMaterial] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const unitLabelFor = (u: "feet" | "inch" | "cm") =>
    u === "feet" ? tx.unitFeet : u === "inch" ? tx.unitInch : tx.unitCm;

  const formPreview = useMemo(() => {
    const lines: string[] = [
      lang === "mr" ? "नमस्कार PrintShubh, मला खालील Quick Enquiry साठी किंमत हवी आहे." : "Hello PrintShubh, I'd like a quote for this quick enquiry.",
      `${tx.collectionLabel}: ${collection.title[lang]}`,
    ];
    if (formName.trim()) lines.push(`${tx.nameLabel}: ${formName.trim()}`);
    if (formMobile.trim()) lines.push(`${tx.mobileLabel.replace(/\s*\(.*?\)\s*/, "")}: ${formMobile.trim()}`);
    if (formWidth.trim() || formHeight.trim()) {
      const w = formWidth.trim();
      const h = formHeight.trim();
      const size = w && h ? `${w} x ${h}` : w || h;
      lines.push(`${lang === "mr" ? "माप" : "Size"}: ${size} ${unitLabelFor(formUnit)}`);
    }
    lines.push(`${tx.qtyLabel}: ${formQty.trim() || "1"}`);
    if (formMaterial.trim()) lines.push(`${tx.materialLabel.replace(/\s*\(.*?\)\s*/, "")}: ${formMaterial.trim()}`);
    if (formNotes.trim()) lines.push(`${tx.notesLabel.replace(/\s*\(.*?\)\s*/, "")}: ${formNotes.trim()}`);
    return lines.join("\n");
  }, [lang, tx, collection, formName, formMobile, formWidth, formHeight, formUnit, formQty, formMaterial, formNotes]);

  const formSendHref = buildWhatsAppUrl({
    message: formPreview,
    campaign: collection.slug,
    content: "quick-enquiry-form",
  });

  const nameFilled = formName.trim().length > 0;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
        <section ref={sectionRef} className="border-b border-slate-200 bg-[#f8fbff] px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
          <div className="mx-auto max-w-6xl">
            <nav className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Link href="/" className="inline-flex items-center gap-1 transition hover:text-blue-700">
                <Home className="size-3.5" />
                {tx.home}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <Link href="/#collections" className="transition hover:text-blue-700">
                {tx.collections}
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-700">{collection.shortTitle[lang]}</span>
            </nav>

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <Reveal>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                  {tx.eyebrow}
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                  {collection.title[lang]}
                </h1>
                <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                  {collection.tagline[lang]}
                </p>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-slate-600">
                  {collection.description[lang]}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackWhatsAppLead();
                      trackFunnelEvent("collection_whatsapp_click", {
                        lang,
                        surface: "collection-page",
                        service_key: collection.key,
                      });
                    }}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                  >
                    <MessageCircle className="size-4" />
                    {tx.ctaAsk}
                  </a>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-500">{tx.note}</p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="aspect-[4/3] w-full">
                  <CollectionVisual collectionKey={collection.key} shortTitle={collection.shortTitle[lang]} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <Reveal>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                  {tx.appsHeading}
                </h2>
              </Reveal>
              <Stagger as="ul" className="mt-4 grid grid-cols-2 gap-2.5">
                {collection.applications.map((app) => (
                  <StaggerItem as="li" key={app.en}>
                    <div className="ps-glass flex h-full items-center rounded-2xl px-3.5 py-3 text-[13.5px] font-bold leading-5 text-slate-800">
                      {app[lang]}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            <div>
              <Reveal>
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                  {tx.materialHeading}
                </h2>
              </Reveal>
              <Stagger as="ul" className="mt-4 grid gap-2.5">
                {collection.materialInfo.map((info) => (
                  <StaggerItem as="li" key={info.en}>
                    <div className="ps-glass flex items-center gap-3 rounded-2xl px-4 py-3 text-[14px] font-semibold leading-5 text-slate-700">
                      <Ruler className="size-4 shrink-0 text-blue-700" aria-hidden="true" />
                      {info[lang]}
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>

          {/* Real-photo gallery — renders nothing until Collection.photos
              (collections.ts) has entries for this collection. */}
          {hasCollectionPhotos(collection) && (
            <Reveal delay={0.1}>
              <div className="mx-auto mt-10 max-w-6xl">
                <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                  {tx.galleryHeading}
                </h2>
                <ul className="ps-scroll-x mt-4 flex gap-4 pb-2">
                  {collection.photos.map((photo) => (
                    <li
                      key={photo.src}
                      className="ps-snap w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:w-[46vw] lg:w-[22rem]"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <Image
                          src={photo.src}
                          alt={photo.alt[lang]}
                          width={photo.width}
                          height={photo.height}
                          loading="lazy"
                          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 22rem"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.1}>
            <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-blue-100 bg-[#f8fbff] p-6 sm:p-8">
              <h2 className="text-lg font-black text-slate-950">{tx.customSizeHeading}</h2>
              <p className="mt-1.5 max-w-xl text-[14.5px] leading-6 text-slate-600">{tx.customSizeBody}</p>
              <a
                href={waHrefCustomSize}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppLead();
                  trackFunnelEvent("collection_whatsapp_click", {
                    lang,
                    surface: "collection-page",
                    service_key: collection.key,
                  });
                }}
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-bold text-green-800 transition hover:border-green-300 hover:bg-green-100"
              >
                <Ruler className="size-4" aria-hidden="true" />
                {tx.ctaCustomSize}
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mx-auto mt-10 max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-black text-slate-950">{tx.formHeading}</h2>
              <p className="mt-1.5 max-w-xl text-[14.5px] leading-6 text-slate-600">{tx.formBody}</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.nameLabel} *</span>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={tx.namePlaceholder}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.mobileLabel}</span>
                  <input
                    type="tel"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value.replace(/[^\d+ ]/g, ""))}
                    placeholder={tx.mobilePlaceholder}
                    maxLength={15}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.collectionLabel}</span>
                  <input
                    type="text"
                    value={collection.title[lang]}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[15px] text-slate-600"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.qtyLabel}</span>
                  <input
                    type="number"
                    min={1}
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.widthLabel}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formWidth}
                    onChange={(e) => setFormWidth(e.target.value.replace(/[^\d.]/g, ""))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                  />
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.heightLabel}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value.replace(/[^\d.]/g, ""))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                  />
                </label>

                {(formWidth.trim() || formHeight.trim()) && (
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-slate-700">{tx.unitLabel}</span>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value as "feet" | "inch" | "cm")}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                    >
                      <option value="feet">{tx.unitFeet}</option>
                      <option value="inch">{tx.unitInch}</option>
                      <option value="cm">{tx.unitCm}</option>
                    </select>
                  </label>
                )}

                {collection.materialOptions.length > 0 && (
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-slate-700">{tx.materialLabel}</span>
                    <select
                      value={formMaterial}
                      onChange={(e) => setFormMaterial(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                    >
                      <option value="">{tx.materialPlaceholder}</option>
                      {collection.materialOptions.map((opt) => (
                        <option key={opt[lang]} value={opt[lang]}>
                          {opt[lang]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-semibold text-slate-700">{tx.notesLabel}</span>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder={tx.notesPlaceholder}
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-[15px] outline-none focus:border-blue-500"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{tx.previewLabel}</p>
                <p className="mt-2 whitespace-pre-line text-[14px] leading-6 text-slate-700">{formPreview}</p>
              </div>

              {!nameFilled && (
                <p className="mt-3 text-xs font-semibold text-amber-700">{tx.nameRequiredNote}</p>
              )}

              {nameFilled ? (
                <a
                  href={formSendHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    trackWhatsAppLead();
                    trackFunnelEvent("collection_whatsapp_click", {
                      lang,
                      surface: "collection-page",
                      service_key: collection.key,
                    });
                  }}
                  className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-md bg-green-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-green-700"
                >
                  <MessageCircle className="size-4" />
                  {tx.sendCta}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="mt-4 inline-flex min-h-[48px] cursor-not-allowed items-center gap-2 rounded-md bg-slate-300 px-5 text-sm font-bold text-slate-500 shadow-sm"
                >
                  <MessageCircle className="size-4" />
                  {tx.sendCta}
                </button>
              )}
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-6xl">
            <Reveal>
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
                {tx.relatedHeading}
              </h2>
            </Reveal>
            <Stagger as="ul" className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((rc) => (
                <StaggerItem as="li" key={rc.key}>
                  <Link
                    href={`/collections/${rc.slug}/`}
                    className="ps-glass flex h-full flex-col gap-1 rounded-2xl px-4 py-4 transition hover:border-blue-300"
                  >
                    <span className="text-[13px] font-black uppercase tracking-[0.08em] text-blue-700">
                      {tx.eyebrow}
                    </span>
                    <span className="text-[15px] font-black text-slate-950">{rc.shortTitle[lang]}</span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      </main>
      <WhatsAppSupportButton />
      <SiteFooter />
    </>
  );
}
