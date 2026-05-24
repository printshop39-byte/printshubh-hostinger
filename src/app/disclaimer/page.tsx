import type { Metadata } from "next";
import { DisclaimerContent } from "./disclaimer-content";

export const metadata: Metadata = {
  title: "अस्वीकरण | Disclaimer — PrintShubh",
  description:
    "PrintShubh ही खाजगी सहाय्य सेवा आहे — सरकारी संकेतस्थळ नाही. अंतिम जमीन नोंदी अधिकृत पोर्टलवरून पडताळून पहाव्यात.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return <DisclaimerContent />;
}
