"use client";

import {
  Building2,
  ClipboardList,
  Clock,
  FileText,
  IndianRupee,
  Layers,
  Map,
  MapPinned,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";

/* Delivery promise shown on every service card. These are uniform across
 * services and reflect the model already described on the FAQ page —
 * PDF delivered on WhatsApp, UPI payment, usually same day — so nothing
 * here is a new or unverified claim. */
const deliveryBadges: { icon: LucideIcon; label: Record<Lang, string> }[] = [
  { icon: FileText, label: { mr: "PDF", en: "PDF" } },
  { icon: MessageCircle, label: { mr: "WhatsApp", en: "WhatsApp" } },
  { icon: Clock, label: { mr: "बहुतेक त्याच दिवशी", en: "Usually same day" } },
  { icon: IndianRupee, label: { mr: "UPI पेमेंट", en: "UPI payment" } },
];

type ServiceItem = {
  icon: LucideIcon;
  title: {
    mr: string;
    en: string;
  };
  detail: {
    mr: string;
    en: string;
  };
};

const services: ServiceItem[] = [
  {
    title: { mr: "7/12 उतारा", en: "7/12" },
    detail: {
      mr: "जमीन गट, धारक, क्षेत्र आणि पीक नोंदी समजून घेण्यासाठी सहाय्य.",
      en: "Assistance for understanding land plot, holder, area and crop records.",
    },
    icon: FileText,
  },
  {
    title: { mr: "8A उतारा", en: "8A" },
    detail: {
      mr: "खाते, जमाबंदी आणि संबंधित नोंदींसाठी तपासणी मार्गदर्शन.",
      en: "Verification guidance for account, jamabandi and related records.",
    },
    icon: ClipboardList,
  },
  {
    title: { mr: "स्वामित्व चौकशी नोंद", en: "Svamitva Enquiry Register" },
    detail: {
      mr: "स्वामित्व योजनेतील मालमत्ता/घर नोंद तपासण्यासाठी सहाय्य.",
      en: "Assistance to check property/house records under the Svamitva scheme.",
    },
    icon: MapPinned,
  },
  {
    title: { mr: "ई-फेरफार", en: "eFerfar (Mutation)" },
    detail: {
      mr: "फेरफार अर्ज, नोंद आणि स्थिती तपासण्यासाठी मार्गदर्शन.",
      en: "Guidance to check mutation application, record and status.",
    },
    icon: RefreshCw,
  },
  {
    title: { mr: "मिळकत पत्रिका", en: "Property Card" },
    detail: {
      mr: "शहरी मालमत्ता नोंदी आणि कार्ड संदर्भ तपासणीसाठी मदत.",
      en: "Help with checking urban property records and card reference.",
    },
    icon: Building2,
  },
  {
    title: { mr: "मिळकत पत्रिकेचे फेरफार", en: "Property Card Mutation" },
    detail: {
      mr: "Property Card वरील बदल आणि फेरफार माहिती तपासण्यासाठी.",
      en: "To check changes and mutation information on Property Card.",
    },
    icon: RefreshCw,
  },
  {
    title: { mr: "मुंबई शहर मिळकत पत्रिका", en: "Property Card Mumbai City" },
    detail: {
      mr: "मुंबई शहरातील property card/CTS माहिती तपासण्यासाठी.",
      en: "To check property card/CTS information in Mumbai city.",
    },
    icon: Building2,
  },
  {
    title: { mr: "ई-अभिलेख", en: "eRecords" },
    detail: {
      mr: "जुने जमीन रेकॉर्ड आणि स्कॅन दस्तऐवज शोधण्यासाठी.",
      en: "To search old land records and scanned documents.",
    },
    icon: Layers,
  },
  {
    title: { mr: "स्वामित्व नकाशे", en: "Svamitva Maps" },
    detail: {
      mr: "गावठाण/मालमत्ता नकाशा संदर्भ तपासण्यासाठी सहाय्य.",
      en: "Assistance to check Gaothan/property map reference.",
    },
    icon: Map,
  },
];

const sectionLabel: Record<Lang, string> = {
  mr: "सेवा",
  en: "Services",
};

const sectionHeading: Record<Lang, string> = {
  mr: "जमीन कागदपत्रांसाठी आवश्यक सेवा एका ठिकाणी.",
  en: "All essential services for land documents in one place.",
};

const sectionSubtext: Record<Lang, string> = {
  mr: "प्रत्येक विनंतीसाठी योग्य स्रोत, दस्तऐवज प्रकार आणि पुढील कृती स्पष्ट करून दिली जाते.",
  en: "For each request, the right source, document type and next steps are clearly explained.",
};

export function ServicesGrid() {
  const { lang } = useLang();

  return (
    <section id="services" className="bg-[#f8fbff] px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">{sectionLabel[lang]}</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
              {sectionHeading[lang]}
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-slate-600">
            {sectionSubtext[lang]}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            const title = service.title[lang];

            return (
              <article
                data-reveal
                key={service.title.en}
                className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="grid size-11 place-items-center rounded-md bg-blue-50 text-blue-700">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{service.detail[lang]}</p>

                {/* Uniform delivery badges — pinned to the card bottom so the
                    grid stays visually aligned regardless of detail length. */}
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  {deliveryBadges.map((b) => {
                    const BadgeIcon = b.icon;
                    return (
                      <li
                        key={b.label.en}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        <BadgeIcon className="size-3 text-blue-600" aria-hidden="true" />
                        {b.label[lang]}
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
