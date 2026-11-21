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
      updatedAt="May 2026"
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
          PrintShubh is a private document-assistance service. We help users
          look up land records, maps and revenue entries by referencing
          information already published on official public sources, and we
          deliver that information in a clear, usable form.
        </p>
        <p>
          <strong>We are not a government department.</strong> PrintShubh is
          not a government body, Tehsil office, Bhumi Abhilekh department or
          an authorised representative of any revenue office. Our service is
          guidance and assistance only.
        </p>
      </LegalSection>

      <LegalSection heading="2. Verification of final records">
        <p>
          Any 7/12, 8A, eFerfar (mutation), Property Card, village map or
          other document delivered by PrintShubh is for preliminary reference
          only. Before any legal use, the user must verify the final record
          on the{" "}
          <strong>
            official government portal — Mahabhumi, Bhulekh, iGR, MahaRERA,
            or the relevant Tehsil office
          </strong>
          .
        </p>
      </LegalSection>

      <LegalSection heading="3. Service availability">
        <LegalList
          items={[
            "Availability depends on the status of the official government portals. Downtime, server problems or data maintenance on those portals can prevent us from delivering certain records.",
            "Information supplied by the user (district, taluka, village, gut / survey / CTS number) must be accurate. If incorrect input produces an incorrect report, PrintShubh is not liable.",
            "Some villages, urban areas or older entries may not be digitised — in such cases we may decline and start a refund.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Payment and fees">
        <LegalList
          items={[
            "Fees for each service are confirmed on WhatsApp before payment.",
            "Payments are accepted via UPI / bank transfer / WhatsApp.",
            "Fees cover the cost of lookup, processing and assistance — they are not a charge for any government approval.",
            "Once a service has been started, refunds are governed by our Refund Policy.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. No guarantee of approval">
        <p>
          PrintShubh does not guarantee any government approval, correction,
          mutation entry, change of ownership, or final clearance of a
          document workflow. We only help with lookup, explanation and
          guidance. Final approval depends on the decision of the relevant
          government department.
        </p>
      </LegalSection>

      <LegalSection heading="6. User responsibilities">
        <LegalList
          items={[
            "Provide truthful, accurate and lawful information only.",
            "Cross-check PDFs / reports received on WhatsApp against the official portal before any legal use.",
            "Do not use documents received from PrintShubh for resale or fraudulent purposes.",
            "Do not share sensitive information (account numbers, money, ID proofs) with third parties.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="7. Limitation of liability">
        <p>
          PrintShubh is not responsible for losses caused by incorrect
          entries on official portals, downtime, server issues, third-party
          actions or stale data. Our maximum liability is limited to the
          service fee actually paid by the user for the specific service in
          question.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to these terms">
        <p>
          PrintShubh may update these terms at any time. Significant changes
          will be posted on the website. Continued use of the service is
          treated as acceptance of the updated terms.
        </p>
      </LegalSection>

      <LegalSection heading="9. Governing law">
        <p>
          These terms are governed by Indian law. Any dispute is subject to
          the exclusive jurisdiction of the competent courts in Maharashtra,
          India.
        </p>
      </LegalSection>
    </>
  );
}
