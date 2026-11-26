import type { Metadata } from "next";
import { WallpaperTermsContent } from "./wallpaper-terms-content";

export const metadata: Metadata = {
  title: "Customised Wallpaper Terms & Conditions",
  description:
    "Terms for made-to-measure wallpaper orders at PRINTSHUBH, Kolhapur: approval and advance, measurements, colours, checking before installation, wall condition and jurisdiction.",
  alternates: { canonical: "/wallpaper-terms" },
};

export default function WallpaperTermsPage() {
  return <WallpaperTermsContent />;
}
