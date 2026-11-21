"use client";

import { AlertTriangle } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";

export function DisclaimerContent() {
  return (
    <LegalPageShell
      title="Disclaimer"
      breadcrumb="Disclaimer"
      intro="Please read this disclaimer carefully. PrintShubh is a private assistance service — it is not a government body, official website or government office."
      updatedAt="May 2026"
      content={<DisclaimerBody />}
    />
  );
}

function DisclaimerBody() {
  const Banner = (
    <div className="mb-6 flex items-start gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-[14px] font-bold leading-7 text-red-900">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-700" />
      <p>
        {"Important notice: PrintShubh.shop is NOT the official website of any government department, Tehsil office or revenue office. We provide private document-assistance only."}
      </p>
    </div>
  );

  /* English */
  return (
    <>
      {Banner}

      <LegalSection heading="1. PrintShubh is not a government body">
        <p>
          PrintShubh.shop is a <strong>private assistance service</strong>{" "}
          for Maharashtra. We are not a representative of the Bhumi Abhilekh
          Department, Revenue Department, IGR office, MahaRERA, any urban
          local body, or any other government office. We have no official
          affiliation with any government department.
        </p>
      </LegalSection>

      <LegalSection heading="2. Source of information">
        <p>
          The information we share is based entirely on what is already
          published on{" "}
          <strong>
            official public sources — Mahabhumi, Bhulekh, Bhuvan, iGR, ULB
            DP / TP publications, MahaRERA and similar government portals
          </strong>
          . We do <strong>not create, approve or modify</strong> any record.
        </p>
      </LegalSection>

      <LegalSection heading="3. Final verification on official portals is required">
        <p>
          Any 7/12, 8A, eFerfar (mutation), Property Card, village map or DP /
          TP map reference delivered by PrintShubh is{" "}
          <strong>for preliminary reference only</strong>. Before any legal
          transaction (sale, purchase, agreement, litigation, bank loan, NA
          permission, etc.) you must verify the final record at the{" "}
          <strong>
            relevant Tehsil office, official government portal or registration
            office
          </strong>
          .
        </p>
      </LegalSection>

      <LegalSection heading="4. Map / map-reference limitations">
        <LegalList
          items={[
            "Village boundaries and base layers shown on the site come from public GIS sources — they are not authoritative survey maps.",
            "Satellite / Hybrid / Terrain layers are provided by third parties such as Esri, OpenStreetMap and OpenTopoMap.",
            "Plot boundaries marked by the user on the map are for reference only — final measurement must be taken by the authorised land survey department.",
            "Areas (acre / guntha / sq.m) are approximate — the figures on the official 7/12 / survey map are what govern.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. Issues on government portals">
        <p>
          PrintShubh is not responsible for{" "}
          <strong>
            downtime, server issues, incorrect entries, scheduled maintenance,
            policy changes or discontinued services
          </strong>{" "}
          on official government portals. In such situations we will inform
          you and may refund the service fee per the Refund Policy.
        </p>
      </LegalSection>

      <LegalSection heading="6. We do not provide legal or financial advice">
        <p>
          PrintShubh does not provide{" "}
          <strong>
            legal advice, tax advice, investment advice or property valuation
          </strong>
          . Our information is for general reference. For legal decisions
          please consult a lawyer, chartered accountant, sub-registrar or
          another qualified professional.
        </p>
      </LegalSection>

      <LegalSection heading="7. Third-party links">
        <p>
          The site may link to government portals and other third-party
          websites. PrintShubh is not responsible for the content, accuracy
          or privacy practices of those sites.
        </p>
      </LegalSection>

      <LegalSection heading="8. Unauthorised use">
        <p>
          PDFs / reports delivered by PrintShubh must not be used for fraud,
          forgery or any unlawful purpose. The user alone is responsible for
          any consequences of such misuse.
        </p>
      </LegalSection>
    </>
  );
}
