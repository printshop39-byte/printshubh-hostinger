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

export const metadata: Metadata = {
  title: "PrintShubh.shop | महाराष्ट्रासाठी जमीन सेवा",
  description:
    "७/१२ उतारा, ८अ, गाव नकाशा, DP/TP Map, Property Card, Mutation/Ferfar आणि Land Report साठी WhatsApp सहाय्य.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
