"use client";

import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";

export function TermsContent() {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      breadcrumb="Terms"
      intro="By using PrintShubh.shop you agree to the terms below. Please read them carefully before using our services."
      updatedAt="November 2026"
      showServiceDisclaimer={false}
      content={<TermsBody />}
    />
  );
}

function TermsBody() {
  /* English */
  return (
    <>
      <LegalSection heading="1. Nature of the service">
        <p>
          PrintShubh is a private business.{" "}
          <strong>We are not a government department.</strong> PrintShubh is
          not a government body or an authorised representative of any
          government office.
        </p>
      </LegalSection>

      <LegalSection heading="2. Payment and fees">
        <LegalList
          items={[
            "Fees for each service are confirmed on WhatsApp before payment.",
            "Payments are accepted via UPI / bank transfer / WhatsApp.",
            "Once a service has been started, refunds are governed by our Refund Policy.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. User responsibilities">
        <LegalList
          items={[
            "Provide truthful, accurate and lawful information only.",
            "Do not share sensitive information (account numbers, money, ID proofs) with third parties.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Limitation of liability">
        <p>
          PrintShubh is not responsible for losses caused by server issues or
          third-party actions. Our maximum liability is limited to the
          service fee actually paid by the user for the specific service in
          question.
        </p>
      </LegalSection>

      <LegalSection heading="5. Changes to these terms">
        <p>
          PrintShubh may update these terms at any time. Significant changes
          will be posted on the website. Continued use of the service is
          treated as acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="6. Governing law">
        <p>
          These terms are governed by Indian law. Any dispute is subject to
          the exclusive jurisdiction of the competent courts in Maharashtra,
          India.
        </p>
      </LegalSection>
    </>
  );
}
