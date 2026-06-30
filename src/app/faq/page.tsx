import type { Metadata } from "next";
import { FaqContent } from "./faq-content";
import { faqs } from "./faq-data";

export const metadata: Metadata = {
  title: "वारंवार विचारले जाणारे प्रश्न | FAQ",
  description:
    "7/12, 8A, फेरफार, गाव नकाशा, DP / TP, WhatsApp PDF, पेमेंट आणि परतावा यांविषयी वारंवार विचारल्या जाणाऱ्या प्रश्नांची उत्तरे.",
  alternates: { canonical: "/faq" },
};

/* FAQPage structured data — emitted from the Marathi source (the page's
 * primary language) so Google can surface FAQ rich results. Rendered
 * server-side from the same data the accordion uses, so the visible Q&A
 * and the schema can never drift apart. */
const faqPageLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.mr.map((p) => ({
    "@type": "Question",
    name: p.q,
    acceptedAnswer: { "@type": "Answer", text: p.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
      />
      <FaqContent />
    </>
  );
}
