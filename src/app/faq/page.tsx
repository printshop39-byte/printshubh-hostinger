import type { Metadata } from "next";
import { FaqContent } from "./faq-content";
import { faqs } from "./faq-data";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | FAQ",
  description:
    "Answers to common questions about PRINTSHUBH Print Collections: pricing, custom sizes, designs, ordering, delivery and payment.",
  alternates: { canonical: "/faq" },
};

/* FAQPage structured data — emitted from the English source, the language the
 * page shows (Google requires the markup to match the visible Q&A). Rendered
 * server-side from the same data the accordion uses, so the visible Q&A and
 * the schema can never drift apart. */
const faqPageLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.en.map((p) => ({
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
