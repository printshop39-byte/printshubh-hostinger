"use client";

import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/legal-page-shell";
import { SITE_CONTACT } from "@/components/site-footer";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

/**
 * Terms for customised (made-to-measure) wallpaper orders. Wording agreed with
 * the owner on 2026-11-26. Keep the contact details and the jurisdiction in
 * line with /terms and the footer.
 */
export function WallpaperTermsContent() {
  return (
    <LegalPageShell
      title="Customised Wallpaper — Terms & Conditions"
      breadcrumb="Wallpaper Terms"
      intro="These terms apply to every customised wallpaper order from PRINTSHUBH. Please read them before you approve your design."
      updatedAt="November 2026"
      showServiceDisclaimer={false}
      content={<WallpaperTermsBody />}
    />
  );
}

const link = "font-semibold text-brand-navy underline underline-offset-4";

function WallpaperTermsBody() {
  const waHref = buildWhatsAppUrl({
    message: "Hello PRINTSHUBH, I want to report an issue with my wallpaper order.",
    campaign: "wallpaper-terms",
  });

  return (
    <>
      <LegalSection heading="1. Made-to-measure orders">
        <p>
          Every customised wallpaper is printed specifically for your approved wall size, design and material. Once
          you have approved the final design and paid the advance, and printing has started, the order cannot be
          cancelled, returned or refunded for a change of mind. If PRINTSHUBH cannot complete your order, your
          advance will be refunded in full.
        </p>
      </LegalSection>

      <LegalSection heading="2. Measurements and approval">
        <p>
          The final wall size, layout, material and price are confirmed with you on WhatsApp before printing. Please
          check the measurements carefully before you approve. We cannot accept responsibility for fitting problems
          caused by measurements supplied by the customer; where we measure the wall ourselves, we will correct any
          error on our side.
        </p>
      </LegalSection>

      <LegalSection heading="3. Colours and previews">
        <p>
          Design images on this website and on WhatsApp are previews. Small differences in colour between a phone or
          computer screen and the printed wallpaper are normal (screen settings, lighting) and are not treated as
          printing defects.
        </p>
      </LegalSection>

      <LegalSection heading="4. Check before installation">
        <p>
          Please inspect every panel for the correct design, size and print quality before pasting. If you find a
          printing defect, a wrong design or transit damage, tell us within 48 hours of receiving the order, with
          clear photos, on{" "}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className={link}>
            WhatsApp ({SITE_CONTACT.phone})
          </a>{" "}
          or by email (
          <a href={`mailto:${SITE_CONTACT.email}`} className={link}>
            {SITE_CONTACT.email}
          </a>
          ). After checking, we will reprint or replace the affected panels. Visible defects reported only after the
          wallpaper has been pasted may not be accepted.
        </p>
      </LegalSection>

      <LegalSection heading="5. Wall condition and installation">
        <p>
          For good adhesion and a long life, the wall must be smooth, clean, primed and fully dry, without dampness,
          seepage or loose paint. To the extent permitted by law, PRINTSHUBH is not liable for bubbling, peeling or
          damage caused by wall moisture, uneven surfaces or installation not carried out by us. Installation is
          charged separately unless it is included in your quote.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your images and designs">
        <p>
          If you supply your own photo or design, you confirm that you own it or have permission to print it. We may
          decline to print content that appears to infringe someone else&apos;s rights.
        </p>
      </LegalSection>

      <LegalSection heading="7. Payment, collection and delivery">
        <p>
          Printing starts only after the advance payment is confirmed. Finished orders can be collected from our
          studio at B-6, Mahalaxmi Chamber, Near C.B. Stand, Shahupuri, Kolhapur, Maharashtra 416001, or dispatched
          as agreed with you.
        </p>
      </LegalSection>

      <LegalSection heading="8. Other policies">
        <p>
          These terms apply to customised wallpaper orders and sit alongside our general{" "}
          <Link href="/terms" className={link}>
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/refund" className={link}>
            Refund Policy
          </Link>
          . If they differ, these terms apply to wallpaper orders.
        </p>
      </LegalSection>

      <LegalSection heading="9. Jurisdiction">
        <p>
          These terms are governed by Indian law. Any dispute is subject to the jurisdiction of the courts at
          Kolhapur, Maharashtra.
        </p>
      </LegalSection>
    </>
  );
}
