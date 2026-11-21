"use client";

import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";

export function PrivacyContent() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      breadcrumb="Privacy"
      intro="PrintShubh respects your privacy. This policy explains what information we collect, how it is used, and how it is protected."
      updatedAt="May 2026"
      content={<PrivacyBody />}
    />
  );
}

function PrivacyBody() {
  /* English */
  return (
    <>
      <LegalSection heading="1. Information we collect">
        <p>To provide our service we may collect the following:</p>
        <LegalList
          items={[
            "Name (if you provide it)",
            "Phone / WhatsApp number — for service contact",
            "District, taluka, village — for the service request",
            "Gut / survey / CTS / khata / ferfar number — for document lookup",
            "WhatsApp messages and any document photos you send us",
            "Payment references — UPI ID, transaction ID (for receipts)",
            "Standard website analytics — IP address, browser, basic usage data",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. How we use it">
        <LegalList
          items={[
            "To provide the service you requested.",
            "For service-related communication on WhatsApp / phone / email.",
            "To verify payments and issue receipts.",
            "Internally, to improve service quality.",
            "To meet legal obligations where required.",
          ]}
        />
        <p>
          <strong>We do not sell your data</strong> — not to advertisers, not
          to marketers, not to data brokers.
        </p>
      </LegalSection>

      <LegalSection heading="3. WhatsApp communication">
        <p>
          If you contact PrintShubh on WhatsApp, your phone number, messages
          and any PDFs / photos you send may be stored alongside the service
          request — only for delivery, support and follow-up. WhatsApp
          conversation itself is protected by Meta&apos;s own privacy policy.
        </p>
      </LegalSection>

      <LegalSection heading="4. Please do not share sensitive information">
        <p>
          Please do not send us your{" "}
          <strong>
            Aadhaar, PAN, bank account, OTP, passwords or other highly
            sensitive identity information
          </strong>{" "}
          on WhatsApp, the form, email or anywhere — our service does not
          need them. Anyone asking for such information may be impersonating
          PrintShubh.
        </p>
      </LegalSection>

      <LegalSection heading="5. Retention">
        <p>
          We typically retain service-related information for about{" "}
          <strong>18 months</strong> after completion (for receipts,
          follow-up and dispute resolution). After that, personally
          identifying records are securely deleted, unless a legal obligation
          requires a different period.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <LegalList
          items={[
            "Right to ask what information we hold about you.",
            "Right to ask us to correct inaccurate information.",
            "Right to ask us to delete your personal references (unless a legal hold applies).",
            "Right to opt out of marketing / non-essential WhatsApp messages.",
          ]}
        />
        <p>
          To exercise any of these, please email{" "}
          <a
            className="font-bold text-blue-700 hover:underline"
            href="mailto:support@printshubh.shop"
          >
            support@printshubh.shop
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies and analytics">
        <p>
          We use standard analytics (page visits, device type) to improve the
          site. This data is not personally identifying. You can disable
          cookies in your browser settings, but some features may not work
          correctly afterwards.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes to this policy">
        <p>
          We may update this policy from time to time. Material changes will
          be posted on the website. Continued use of the site is treated as
          acceptance of the updated policy.
        </p>
      </LegalSection>
    </>
  );
}
