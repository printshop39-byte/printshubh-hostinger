"use client";

import { AlertTriangle } from "lucide-react";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";

export function DisclaimerContent() {
  return (
    <LegalPageShell
      title="Disclaimer"
      breadcrumb="Disclaimer"
      intro="Please read this disclaimer carefully. PrintShubh is a private business — it is not a government body, official website or government office."
      updatedAt="November 2026"
      showServiceDisclaimer={false}
      content={<DisclaimerBody />}
    />
  );
}

function DisclaimerBody() {
  const Banner = (
    <div className="mb-6 flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-[14px] font-bold leading-7 text-red-900">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-700" />
      <p>
        {"Important notice: PrintShubh.shop is NOT the official website of any government department or office."}
      </p>
    </div>
  );

  /* English */
  return (
    <>
      {Banner}

      <LegalSection heading="1. PrintShubh is not a government body">
        <p>
          PrintShubh.shop is a <strong>private business</strong>. We are not a
          representative of any government department or office, and we have
          no official affiliation with any government department.
        </p>
      </LegalSection>

      <LegalSection heading="2. We do not provide legal or financial advice">
        <p>
          PrintShubh does not provide{" "}
          <strong>legal advice, tax advice or investment advice</strong>. Our
          information is for general reference. For legal or financial
          decisions please consult a lawyer, chartered accountant or another
          qualified professional.
        </p>
      </LegalSection>

      <LegalSection heading="3. Third-party links">
        <p>
          The site may link to third-party websites. PrintShubh is not
          responsible for the content, accuracy or privacy practices of those
          sites.
        </p>
      </LegalSection>
    </>
  );
}
