import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "आमच्याबद्दल | About PrintShubh — महाराष्ट्र जमीन कागदपत्र सहाय्य",
  description:
    "PrintShubh म्हणजे काय, आम्ही कोणत्या सेवा देतो, आणि नकाशे व जमीन अभिलेखांच्या ३० वर्षांच्या अनुभवावर आधारित विश्वासार्ह सहाय्य.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutContent />;
}
