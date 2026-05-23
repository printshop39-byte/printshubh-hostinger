"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  Globe2,
  Info,
  LocateFixed,
  Map,
  MessageCircle,
  Play,
  Radar,
  Route,
  Sparkles,
} from "lucide-react";
import { TopographicMapVisual, type TopoDistrictKey } from "@/components/topographic-map-visual";
import { useLang, type Lang } from "@/components/language-context";

type DistrictKey = TopoDistrictKey;

type ServiceInfo = {
  id: string;
  title: { mr: string; en: string };
  use: { mr: string; en: string };
  required: string[];
  result: { mr: string; en: string };
  note: { mr: string; en: string };
};

/* ── UI translations ── */
const ui: Record<Lang, {
  routeLabel: string;
  storyHeading: string;
  storySubtext: string;
  storySteps: Array<{ label: string; title: string; detail: string }>;
  mapSection: string;
  activedistrict: string;
  selectedService: string;
  serviceSelection: string;
  services: string;
  live: string;
  district: string;
  taluka: string;
  village: string;
  selectService: string;
  serviceLabel: string;
  useLabel: string;
  requiredLabel: string;
  resultLabel: string;
  noteLabel: string;
  availabilityNote: string;
  panoramaTitle: string;
  panoramaDetail: string;
  panoramaReady: string;
  officialRef: string;
  officialRefTitle: string;
  officialRefDetail: string;
  officialDisclaimer: string;
  whatsappBtn: string;
  buildMsg: (district: string, taluka: string, village: string, service: string) => string;
}> = {
  mr: {
    routeLabel: "भारत > महाराष्ट्र > जिल्हा",
    storyHeading: "महाराष्ट्र नकाशा आणि जमीन सेवा मार्ग.",
    storySubtext:
      "जिल्हा, तालुका, गाव आणि सेवा निवडीसाठी सोपा नकाशा.",
    storySteps: [
      {
        label:  "भारत",
        title:  "देश संदर्भ",
        detail: "नकाशावर भारताचा संदर्भ marker आणि मार्ग रेषा दाखवली आहे.",
      },
      {
        label:  "महाराष्ट्र",
        title:  "राज्य नकाशा",
        detail: "महाराष्ट्राची रूपरेषा आणि contour lines नकाशा.",
      },
      {
        label:  "जिल्हा",
        title:  "जिल्हा निवड",
        detail: "नकाशावर marker क्लिक करा — जिल्हा, तालुका, गाव लगेच बदलतात.",
      },
    ],
    mapSection: "महाराष्ट्र नकाशा",
    activedistrict: "निवडलेला जिल्हा",
    selectedService: "निवडलेली सेवा",
    serviceSelection: "सेवा निवड",
    services: "सेवा",
    live: "Live",
    district: "जिल्हा",
    taluka: "तालुका",
    village: "गाव",
    selectService: "सेवा निवडा",
    serviceLabel: "सेवा",
    useLabel: "अ. उपयोग",
    requiredLabel: "ब. आवश्यक",
    resultLabel: "क. परिणाम",
    noteLabel: "ड. नोंद",
    availabilityNote: "सेवेची उपलब्धता अधिकृत पोर्टलवर अवलंबून आहे.",
    panoramaTitle: "३६०° / Panorama",
    panoramaDetail: "येथे गाव नकाशा किंवा व्हिडिओ walkthrough एम्बेड करता येतो.",
    panoramaReady: "360 Ready",
    officialRef: "अधिकृत संदर्भ",
    officialRefTitle: "अधिकृत नकाशा संदर्भ",
    officialRefDetail:
      "जमीन नोंदी आणि भौगोलिक माहिती तपासण्यासाठी या अधिकृत प्लॅटफॉर्मचा वापर करा.",
    officialDisclaimer:
      "PrintShubh हे सरकारी पोर्टल नाही. नोंदींची उपलब्धता अधिकृत पोर्टलवर अवलंबून आहे.",
    whatsappBtn: "WhatsApp",
    buildMsg: (district, taluka, village, service) =>
      `नमस्कार, मला ${district} जिल्हा, ${taluka} तालुका, ${village} गावासाठी ${service} सेवेसाठी मदत हवी आहे.`,
  },
  en: {
    routeLabel: "India > Maharashtra > District",
    storyHeading: "Maharashtra Topographic Map and Land Service Route.",
    storySubtext:
      "A simple map in Bhuvan / ArcGIS inspired topographic style for selecting district, taluka, village and service.",
    storySteps: [
      {
        label:  "India",
        title:  "Country Reference",
        detail: "India reference marker and route line shown on the map.",
      },
      {
        label:  "Maharashtra",
        title:  "State Map",
        detail: "Maharashtra outline and contour lines in topographic style.",
      },
      {
        label:  "District",
        title:  "District Selection",
        detail: "Click marker on map — district, taluka, village update instantly.",
      },
    ],
    mapSection: "Maharashtra Map",
    activedistrict: "Active District",
    selectedService: "Selected Service",
    serviceSelection: "Service Selection",
    services: "Services",
    live: "Live",
    district: "District",
    taluka: "Taluka",
    village: "Village",
    selectService: "Select Service",
    serviceLabel: "Service",
    useLabel: "A. Use",
    requiredLabel: "B. Required",
    resultLabel: "C. Result",
    noteLabel: "D. Note",
    availabilityNote: "Service availability depends on official portals.",
    panoramaTitle: "360 / Panorama",
    panoramaDetail: "Village map or video walkthrough can be embedded here.",
    panoramaReady: "360 Ready",
    officialRef: "Official Reference",
    officialRefTitle: "Official Map Reference",
    officialRefDetail:
      "Use these official platforms to verify land records and geographic data.",
    officialDisclaimer:
      "PrintShubh is not a government portal. Record availability depends on official portals.",
    whatsappBtn: "WhatsApp",
    buildMsg: (district, taluka, village, service) =>
      `Hello, I need help with ${service} service for ${district} district, ${taluka} taluka, ${village} village.`,
  },
};

const districtData: Record<DistrictKey, { talukas: Record<string, string[]> }> = {
  Mumbai: {
    talukas: {
      "Mumbai City":     ["Colaba", "Byculla", "Dadar"],
      "Mumbai Suburban": ["Bandra", "Andheri", "Borivali"],
      Thane:             ["Thane City", "Kalwa", "Mumbra"],
    },
  },
  Pune: {
    talukas: {
      Haveli: ["Wagholi", "Lohegaon", "Manjari"],
      Mulshi: ["Pirangut", "Lavale", "Hinjawadi"],
      Maval:  ["Talegaon", "Vadgaon", "Lonavala"],
    },
  },
  Nashik: {
    talukas: {
      Nashik:  ["Makhmalabad", "Deolali", "Pathardi"],
      Sinnar:  ["Musalgaon", "Wavi", "Malegaon"],
      Dindori: ["Vani", "Khedgaon", "Umrale"],
    },
  },
  Nagpur: {
    talukas: {
      Nagpur:  ["Besa", "Hudkeshwar", "Gorewada"],
      Hingna:  ["Wanadongri", "Raipur", "Digdoh"],
      Kamptee: ["Kanhan", "Khasala", "Yerkheda"],
    },
  },
  Kolhapur: {
    talukas: {
      Karvir: ["Shiroli", "Uchgaon", "Pachgaon"],
      Panhala: ["Kodoli", "Waghbil", "Bajar Bhogaon"],
      Shirol:  ["Jaysingpur", "Kurundwad", "Nandani"],
    },
  },
};

const districtLabels: Record<DistrictKey, string> = {
  Mumbai:   "मुंबई",
  Pune:     "पुणे",
  Nashik:   "नाशिक",
  Nagpur:   "नागपूर",
  Kolhapur: "कोल्हापूर",
};

const districtLabelsEn: Record<DistrictKey, string> = {
  Mumbai:   "Mumbai",
  Pune:     "Pune",
  Nashik:   "Nashik",
  Nagpur:   "Nagpur",
  Kolhapur: "Kolhapur",
};

const districtPoints: Array<{ id: DistrictKey; left: string; top: string }> = [
  { id: "Mumbai",   left: "22%", top: "34%" },
  { id: "Nashik",   left: "37%", top: "26%" },
  { id: "Pune",     left: "45%", top: "55%" },
  { id: "Kolhapur", left: "39%", top: "77%" },
  { id: "Nagpur",   left: "75%", top: "36%" },
];

const services: ServiceInfo[] = [
  {
    id: "712",
    title: { mr: "7/12 उतारा", en: "7/12" },
    use: {
      mr: "शेतजमिनीचा मालक, क्षेत्र, पीक, कर्ज/बोजा माहिती तपासण्यासाठी.",
      en: "To check owner, area, crop, loan/encumbrance details of agricultural land.",
    },
    required: ["जिल्हा / District", "तालुका / Taluka", "गाव / Village", "गट नंबर", "सर्वे नंबर"],
    result: { mr: "7/12 उतारा PDF / माहिती.", en: "7/12 Extract PDF / information." },
    note: {
      mr: "उपलब्धतेनुसार online/digital record.",
      en: "Online/digital record subject to availability.",
    },
  },
  {
    id: "8a",
    title: { mr: "8A उतारा", en: "8A" },
    use: {
      mr: "खातेदाराच्या जमिनीची एकत्रित खाते माहिती पाहण्यासाठी.",
      en: "To view consolidated account information of a landholder's land.",
    },
    required: ["जिल्हा / District", "तालुका / Taluka", "गाव / Village", "खाते नंबर", "खातेदार नाव"],
    result: { mr: "8A उतारा.", en: "8A Extract." },
    note: { mr: "जमीन खाते तपासणीसाठी उपयुक्त.", en: "Useful for land account verification." },
  },
  {
    id: "svamitva-enquiry-register",
    title: { mr: "स्वामित्व चौकशी नोंद", en: "Svamitva Enquiry Register" },
    use: {
      mr: "स्वामित्व योजनेतील मालमत्ता/घर नोंद तपासण्यासाठी.",
      en: "To check property/house records under the Svamitva scheme.",
    },
    required: ["गाव / Village", "मालमत्ता क्रमांक", "धारक नाव"],
    result: { mr: "enquiry/register माहिती.", en: "Enquiry/register information." },
    note: { mr: "गावठाण मालमत्ता नोंदीसाठी उपयुक्त.", en: "Useful for Gaothan property records." },
  },
  {
    id: "eferfar",
    title: { mr: "ई-फेरफार", en: "eFerfar (Mutation)" },
    use: {
      mr: "फेरफार अर्ज/नोंद स्थिती पाहण्यासाठी.",
      en: "To check mutation application/record status.",
    },
    required: ["फेरफार क्रमांक", "अर्ज क्रमांक", "गाव माहिती"],
    result: { mr: "फेरफार स्थिती / संबंधित माहिती.", en: "Mutation status / related information." },
    note: {
      mr: "नाव बदल, वारस, खरेदी-विक्री नोंद तपासणीसाठी उपयुक्त.",
      en: "Useful for name change, inheritance, sale-purchase record checks.",
    },
  },
  {
    id: "property-card",
    title: { mr: "मिळकत पत्रिका", en: "Property Card" },
    use: {
      mr: "शहरी मालमत्तेची नोंद, CTS/City Survey माहिती तपासण्यासाठी.",
      en: "To check urban property record, CTS/City Survey information.",
    },
    required: ["शहर/कार्यालय", "CTS नंबर", "प्लॉट नंबर", "मालक नाव"],
    result: { mr: "मिळकत पत्रिका माहिती/PDF.", en: "Property Card information/PDF." },
    note: { mr: "शहरी मालमत्तेसाठी महत्त्वाचे.", en: "Important for urban properties." },
  },
  {
    id: "milkat-ferfar",
    title: { mr: "मिळकत पत्रिकेचे फेरफार", en: "Property Card Mutation" },
    use: {
      mr: "property card वरील बदल/फेरफार तपासण्यासाठी.",
      en: "To check changes/mutations on property card.",
    },
    required: ["CTS नंबर", "फेरफार क्रमांक", "मालक नाव"],
    result: {
      mr: "मिळकत पत्रिका फेरफार माहिती.",
      en: "Property card mutation information.",
    },
    note: {
      mr: "मालकी हक्कातील बदल समजण्यासाठी उपयुक्त.",
      en: "Useful for understanding changes in ownership rights.",
    },
  },
  {
    id: "property-card-mumbai",
    title: { mr: "मुंबई शहर मिळकत पत्रिका", en: "Property Card Mumbai City" },
    use: {
      mr: "मुंबई शहरातील property card/CTS माहिती तपासण्यासाठी.",
      en: "To check property card/CTS information in Mumbai city.",
    },
    required: ["विभाग/वार्ड", "CTS नंबर", "मालमत्ता माहिती"],
    result: {
      mr: "मुंबई शहर मिळकत पत्रिका माहिती.",
      en: "Mumbai City property card information.",
    },
    note: {
      mr: "मुंबईतील मालमत्तेसाठी वेगळी सेवा दाखवा.",
      en: "Separate service for Mumbai properties.",
    },
  },
  {
    id: "erecords",
    title: { mr: "ई-अभिलेख", en: "eRecords" },
    use: {
      mr: "जुने जमीन रेकॉर्ड/स्कॅन दस्तएवज शोधण्यासाठी.",
      en: "To search old land records/scanned documents.",
    },
    required: ["जिल्हा / District", "तालुका / Taluka", "गाव / Village", "दस्तएवज प्रकार", "वर्ष"],
    result: { mr: "उपलब्ध eRecords माहिती.", en: "Available eRecords information." },
    note: { mr: "जुने अभिलेख तपासणीसाठी उपयुक्त.", en: "Useful for checking old records." },
  },
  {
    id: "svamitva-maps",
    title: { mr: "स्वामित्व नकाशे", en: "Svamitva Maps" },
    use: {
      mr: "स्वामित्व योजनेतील गावठाण/मालमत्ता नकाशा पाहण्यासाठी.",
      en: "To view Gaothan/property map under the Svamitva scheme.",
    },
    required: ["जिल्हा / District", "तालुका / Taluka", "गाव / Village", "मालमत्ता क्रमांक"],
    result: {
      mr: "स्वामित्व map संदर्भ माहिती.",
      en: "Svamitva map reference information.",
    },
    note: {
      mr: "गावठाण property mapping साठी उपयुक्त.",
      en: "Useful for Gaothan property mapping.",
    },
  },
];

function MaharashtraMapCard({
  district, onDistrictChange, service, taluka, village, whatsappHref, lang,
}: {
  district: DistrictKey;
  onDistrictChange: (district: DistrictKey) => void;
  service: string;
  taluka: string;
  village: string;
  whatsappHref: string;
  lang: Lang;
}) {
  const tx = ui[lang];
  const distLabel = lang === "en" ? districtLabelsEn[district] : districtLabels[district];

  return (
    <div data-reveal className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(219,234,254,0.8),transparent_44%,rgba(220,252,231,0.65))]" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="relative mx-auto h-72 w-full max-w-sm lg:h-80 lg:w-1/2">
          <div className="maharashtra-silhouette pointer-events-none absolute inset-5" />
          <div className="pointer-events-none absolute inset-0 rounded-lg border border-slate-200 bg-[linear-gradient(90deg,rgba(37,99,235,0.07)_1px,transparent_1px),linear-gradient(0deg,rgba(37,99,235,0.06)_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />
          {districtPoints.map((point) => {
            const active = point.id === district;
            const label = lang === "en" ? districtLabelsEn[point.id] : districtLabels[point.id];
            return (
              <button
                key={point.id}
                type="button"
                aria-label={label}
                onClick={() => onDistrictChange(point.id)}
                className={`district-point pointer-events-auto absolute z-10 ${active ? "district-point-active" : ""}`}
                style={{ left: point.left, top: point.top }}
              >
                <span />
                <strong>{label}</strong>
              </button>
            );
          })}
          <div className="absolute bottom-3 left-3 right-3 z-20 rounded-md border border-blue-200 bg-white/95 p-3 text-sm shadow-sm">
            <p className="font-black text-blue-900">{distLabel}</p>
            <p className="mt-1 text-slate-600">{taluka} / {village}</p>
          </div>
        </div>

        <div className="relative lg:w-1/2">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
            <Radar className="size-4" />
            {lang === "en" ? "Maharashtra Map" : "महाराष्ट्र नकाशा"}
          </p>
          <h3 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
            {distLabel} / {service}
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{tx.activedistrict}</p>
              <p className="mt-1 text-lg font-black text-blue-800">{distLabel}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{tx.selectedService}</p>
              <p className="mt-1 text-lg font-black text-blue-800">{service}</p>
            </div>
          </div>
          <a
            href={whatsappHref}
            className="pointer-events-auto mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-base font-black text-white shadow-sm transition hover:bg-green-700"
          >
            <MessageCircle className="size-5" />
            {tx.whatsappBtn}
          </a>
        </div>
      </div>
    </div>
  );
}

function ServiceInfoCard({ district, service, taluka, village, lang }: {
  district: DistrictKey;
  service: ServiceInfo;
  taluka: string;
  village: string;
  lang: Lang;
}) {
  const tx = ui[lang];
  const distLabel = lang === "en" ? districtLabelsEn[district] : districtLabels[district];
  const serviceTitle = service.title[lang];

  const whatsappText = encodeURIComponent(tx.buildMsg(distLabel, taluka, village, serviceTitle));
  const whatsappHref = "https://wa.me/918625801907?text=" + whatsappText;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-blue-800">
            <FileText className="size-4" />
            {tx.serviceLabel}
          </p>
          <h4 className="mt-2 text-2xl font-black text-slate-950">{serviceTitle}</h4>
        </div>
        <a
          href={whatsappHref}
          className="pointer-events-auto inline-flex h-11 items-center justify-center gap-2 rounded-md bg-green-600 px-4 text-sm font-black text-white transition hover:bg-green-700"
        >
          <MessageCircle className="size-4" />
          {tx.whatsappBtn}
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-blue-800">{tx.useLabel}</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{service.use[lang]}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-blue-800">{tx.requiredLabel}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {service.required.map((item) => (
              <span key={item} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-blue-800">{tx.resultLabel}</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{service.result[lang]}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-black text-blue-800">{tx.noteLabel}</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{service.note[lang]}</p>
        </div>
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-semibold leading-6 text-amber-900">
        <Info className="mt-0.5 size-4 shrink-0" />
        {tx.availabilityNote}
      </p>
    </div>
  );
}

export function StorytellingSection() {
  const { lang } = useLang();
  const tx = ui[lang];

  const [location, setLocation] = useState<{
    district: DistrictKey;
    taluka: string;
    village: string;
  }>({
    district: "Mumbai",
    taluka: "Mumbai City",
    village: "Colaba",
  });
  const [selectedServiceId, setSelectedServiceId] = useState(services[0].id);
  const talukas = useMemo(
    () => Object.keys(districtData[location.district].talukas),
    [location.district],
  );
  const villages = useMemo(
    () => districtData[location.district].talukas[location.taluka] ?? [],
    [location.district, location.taluka],
  );
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];

  const updateDistrict = (nextDistrict: DistrictKey) => {
    const nextTaluka = Object.keys(districtData[nextDistrict].talukas)[0];
    const nextVillage = districtData[nextDistrict].talukas[nextTaluka][0];
    setLocation({ district: nextDistrict, taluka: nextTaluka, village: nextVillage });
  };
  const updateTaluka = (nextTaluka: string) => {
    setLocation((cur) => ({
      ...cur,
      taluka: nextTaluka,
      village: districtData[cur.district].talukas[nextTaluka][0],
    }));
  };
  const updateVillage = (nextVillage: string) =>
    setLocation((cur) => ({ ...cur, village: nextVillage }));

  const { district, taluka, village } = location;
  const distLabel = lang === "en" ? districtLabelsEn[district] : districtLabels[district];
  const serviceTitle = selectedService.title[lang];

  const whatsappText = encodeURIComponent(tx.buildMsg(distLabel, taluka, village, serviceTitle));
  const whatsappHref = "https://wa.me/918625801907?text=" + whatsappText;

  return (
    <section id="story" className="relative overflow-hidden bg-white px-5 py-20 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_42%,#f0f9ff_100%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
        <div data-reveal>
          <p className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">
            <Globe2 className="size-4" />
            <span>{tx.routeLabel}</span>
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
            {tx.storyHeading}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {tx.storySubtext}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {tx.storySteps.map((step) => (
              <div data-reveal key={step.label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">{step.label}</p>
                <h3 className="mt-3 text-lg font-black leading-snug text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>

          <div data-reveal className="relative mt-8">
            <TopographicMapVisual
              district={district}
              onDistrictChange={updateDistrict}
              taluka={taluka}
              village={village}
            />
          </div>
        </div>

        <div className="space-y-6">
          <MaharashtraMapCard
            district={district}
            onDistrictChange={updateDistrict}
            service={serviceTitle}
            taluka={taluka}
            village={village}
            whatsappHref={whatsappHref}
            lang={lang}
          />

          <div data-reveal className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-blue-800">
                  <LocateFixed className="size-4" />
                  {tx.serviceSelection}
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{tx.services}</h3>
              </div>
              <span className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                {tx.live}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <label htmlFor="district" className="text-sm font-bold text-slate-700">
                {tx.district}
                <select
                  id="district"
                  name="district"
                  value={district}
                  onChange={(e) => updateDistrict(e.target.value as DistrictKey)}
                  className="pointer-events-auto mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500"
                >
                  {Object.keys(districtData).map((item) => (
                    <option key={item} value={item}>
                      {lang === "en" ? districtLabelsEn[item as DistrictKey] : districtLabels[item as DistrictKey]}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="taluka" className="text-sm font-bold text-slate-700">
                {tx.taluka}
                <select
                  id="taluka"
                  name="taluka"
                  value={taluka}
                  onChange={(e) => updateTaluka(e.target.value)}
                  className="pointer-events-auto mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500"
                >
                  {talukas.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label htmlFor="village" className="text-sm font-bold text-slate-700">
                {tx.village}
                <select
                  id="village"
                  name="village"
                  value={village}
                  onChange={(e) => updateVillage(e.target.value)}
                  className="pointer-events-auto mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500"
                >
                  {villages.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-sm font-bold text-slate-700">{tx.selectService}</p>
              <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`pointer-events-auto min-h-12 rounded-md border px-3 py-2 text-left text-sm font-bold transition ${
                      selectedService.id === service.id
                        ? "border-blue-700 bg-blue-700 text-white shadow-sm"
                        : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    {service.title[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <ServiceInfoCard
                district={district}
                service={selectedService}
                taluka={taluka}
                village={village}
                lang={lang}
              />
            </div>
          </div>

          <div data-reveal className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-video min-h-56">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#e0f2fe,#ffffff_50%,#dcfce7)]" />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(37,99,235,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                <div className="grid size-16 place-items-center rounded-full border border-blue-200 bg-white shadow-sm">
                  <Play className="ml-1 size-7 fill-blue-700 text-blue-700" />
                </div>
                <p className="mt-5 text-lg font-black text-slate-950">{tx.panoramaTitle}</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  {tx.panoramaDetail}
                </p>
              </div>
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-800 shadow-sm">
                <Sparkles className="size-3.5 text-green-600" />
                {tx.panoramaReady}
              </div>
            </div>
          </div>

          <div data-reveal className="rounded-lg border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
                <Map className="size-3.5" />
                {tx.officialRef}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-black text-slate-950">{tx.officialRefTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {tx.officialRefDetail}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href="https://bhuvan-app1.nrsc.gov.in/bhuvan2d2.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800 transition hover:border-blue-500 hover:bg-blue-100"
              >
                <Globe2 className="size-4 shrink-0" />
                Bhuvan 2D
                <ExternalLink className="size-3.5 shrink-0 opacity-60" />
              </a>
              <a
                href="https://bhuvan-app1.nrsc.gov.in/globe/3d.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-800 transition hover:border-indigo-500 hover:bg-indigo-100"
              >
                <Globe2 className="size-4 shrink-0" />
                Bhuvan 3D Globe
                <ExternalLink className="size-3.5 shrink-0 opacity-60" />
              </a>
              <a
                href="https://www.arcgis.com/apps/mapviewer/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-slate-500 hover:bg-slate-100"
              >
                <Map className="size-4 shrink-0" />
                ArcGIS Map Viewer
                <ExternalLink className="size-3.5 shrink-0 opacity-60" />
              </a>
            </div>
            <p className="mt-4 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {tx.officialDisclaimer}
            </p>
          </div>

          <div data-reveal className="flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-4 text-sm font-semibold leading-7 text-slate-700">
            <Route className="mt-1 size-5 shrink-0 text-blue-700" />
            {distLabel} / {taluka} / {village} / {serviceTitle}
            <ArrowRight className="mt-1 size-4 shrink-0 text-green-600" />
          </div>
        </div>
      </div>
    </section>
  );
}
