import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { LanguageProvider } from "@/components/language-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const SITE_URL = "https://www.printshubh.shop";

/* ── Site-wide metadata ────────────────────────────────────────────────
 *
 * metadataBase lets every Open Graph / Twitter image URL on child pages
 * stay relative ("/og.png") and still resolve to the canonical
 * https://www.printshubh.shop/og.png.
 *
 * The homepage overrides title / description in src/app/page.tsx — this
 * default copy is what every other page inherits unless it sets its own. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
    template: "%s | PrintShubh",
  },
  description:
    "७/१२ उतारा, ८अ, गाव नकाशा, DP/TP Map, Property Card, Mutation/Ferfar आणि Land Report साठी WhatsApp सहाय्य.",
  applicationName: "PrintShubh",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    url: SITE_URL + "/",
    siteName: "PrintShubh",
    title: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
    description:
      "महाराष्ट्रातील जमीन कागदपत्रांसाठी WhatsApp सहाय्य — 7/12, 8A, गाव नकाशा, DP Map, मिळकत पत्रिका.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
    description:
      "महाराष्ट्रातील जमीन कागदपत्रांसाठी WhatsApp सहाय्य.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

/* ── JSON-LD: ProfessionalService + WebSite ──────────────────────────
 *
 * Two structured-data blocks injected once at the root layout so every
 * page inherits them. ProfessionalService is the entity card Google may
 * use for the knowledge panel; WebSite enables the sitelinks search box
 * if Google deems the domain authoritative.
 *
 * Both blocks deliberately repeat the "not a government website"
 * disclaimer inside the `description` field — Google reads JSON-LD as
 * structured truth, so the disclaimer reaches search snippets too. */
const professionalServiceLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "PrintShubh",
  url: SITE_URL + "/",
  telephone: "+91 86258 01907",
  email: "support@printshubh.shop",
  areaServed: {
    "@type": "State",
    name: "Maharashtra",
  },
  serviceType: [
    "7/12 Utara Assistance",
    "8A Utara Assistance",
    "Gav Nakasha Assistance",
    "DP Map Assistance",
    "Property Card Assistance",
    "E-Ferfar Assistance",
    "Land Report Assistance",
  ],
  description:
    "PrintShubh provides private WhatsApp assistance for Maharashtra land documents such as 7/12, 8A, Gav Nakasha, DP Map, Property Card and land reports based on official sources. PrintShubh is not a government website.",
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PrintShubh",
  url: SITE_URL + "/",
  inLanguage: "mr-IN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr-IN"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full`}
    >
      <head>
        {/* Structured data — kept in a single Script-free <script> tag so
            it's emitted server-side with no JS-evaluation cost. Two
            entities, two tags — easier to validate in Rich Results Test. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(professionalServiceLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteLd),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
