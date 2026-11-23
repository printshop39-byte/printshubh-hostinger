"use client";

import { MessageCircle, Phone } from "lucide-react";
import {
  LegalList,
  LegalPageShell,
  LegalSection,
} from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function RefundContent() {
  return (
    <LegalPageShell
      title="Refund Policy"
      breadcrumb="Refund"
      intro="When refunds are issued, when they are not, and how to request help if something goes wrong with a payment."
      updatedAt="November 2026"
      showServiceDisclaimer={false}
      content={<RefundBody />}
    />
  );
}

function RefundBody() {
  /** WhatsApp deep-link with a pre-filled refund-support message. */
  const waMsg = "Hello PrintShubh, I need help with a refund / payment issue.";
  const waHref = buildWhatsAppUrl({ message: waMsg, campaign: "refund" });

  const ContactCta = (
    <div className="my-6 grid gap-3 rounded-xl border border-forest/15 bg-ivory p-4 sm:grid-cols-2">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-forest"
      >
        <MessageCircle className="size-4 text-[#5fc48c]" aria-hidden="true" />
        Chat on WhatsApp
      </a>
      <a
        href={`tel:${SITE_CONTACT.phoneTel}`}
        className="btn btn-secondary"
      >
        <Phone className="size-4" />
        {SITE_CONTACT.phone}
      </a>
    </div>
  );

  /* English */
  return (
    <>
      <LegalSection heading="1. When a refund may be issued">
        <LegalList
          items={[
            "Your payment was successful but work has not yet started.",
            "A duplicate payment was made for the same service due to a technical glitch.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="2. When a refund is not available">
        <LegalList
          items={[
            "Once the service has been completed, refunds are generally not available.",
            "You confirmed the service on WhatsApp and then asked us to stop because of change of mind.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. How to request a refund">
        <LegalList
          items={[
            "Raise the issue on WhatsApp within 72 hours of payment.",
            "Send the payment screenshot, your service request ID (if any), and a short description of the problem.",
            "We respond within 48 working hours.",
            "If approved, refunds are sent back to the same UPI / bank account within 5-7 working days.",
          ]}
        />
      </LegalSection>

      {ContactCta}

      <LegalSection heading="4. Payment deducted but no service received">
        <p>
          If your UPI / bank shows the payment deducted but PrintShubh has not
          confirmed or started the service, please send a screenshot on
          WhatsApp immediately. We will check the payment with the UPI /
          bank, and if it turns out to be a failed transaction the amount is
          automatically reversed under UPI / bank rules (usually within 3-7
          working days).
        </p>
      </LegalSection>

      <LegalSection heading="5. Refund decision">
        <p>
          Each refund request is reviewed on a{" "}
          <strong>case-by-case basis</strong>. Work performed, time spent,
          and any error on the user&apos;s side are all considered. PrintShubh&apos;s decision is final.
        </p>
      </LegalSection>

      <LegalSection heading="6. Good-faith handling">
        <p>
          PrintShubh values customer satisfaction. If a service genuinely
          cannot be delivered, or you have a real concern, we will either
          refund honestly or offer to complete the service. Please reach out
          on WhatsApp first — we will try to help.
        </p>
      </LegalSection>
    </>
  );
}
