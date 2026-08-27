"use client";

/**
 * SiteHeader — sticky top bar used on every route (homepage, service page
 * shells, legal page shell).
 *
 * Structure: brand wordmark · primary nav · language toggle · WhatsApp CTA.
 *
 * The nav is split into `primary` and `more`:
 *   - primary  — the four service categories plus About/Contact. These are
 *                what the shop wants a first-time visitor to see, so they
 *                get the desktop bar.
 *   - more     — tools, the map finder, FAQ and support. Still one tap away
 *                in the mobile sheet and always present in the footer, so
 *                nothing that used to be reachable stopped being reachable.
 *
 * Scroll behaviour: past ~12px the bar loses a little height, gains a blur
 * and a stronger border. It is a CSS transition on a boolean, not a
 * scroll-linked animation, so it costs one class swap and no rAF loop.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { useLang, type Lang } from "@/components/language-context";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";

interface NavItem {
  label: Record<Lang, string>;
  href: string;
}

/* Shown in the desktop bar AND at the top of the mobile sheet. */
const primary: NavItem[] = [
  { label: { mr: "मुख्यपृष्ठ", en: "Home" }, href: "/" },
  { label: { mr: "प्रिंटिंग व झेरॉक्स", en: "Printing & Xerox" }, href: "/printing-xerox" },
  { label: { mr: "फोटो", en: "Photo" }, href: "/photo-services" },
  { label: { mr: "जमीन कागदपत्रे", en: "Land Documents" }, href: "/#land-documents" },
  { label: { mr: "ऑनलाइन सेवा", en: "Online Services" }, href: "/digital-services" },
  { label: { mr: "आमच्याबद्दल", en: "About" }, href: "/about" },
  { label: { mr: "संपर्क", en: "Contact" }, href: "/contact" },
];

/* Mobile sheet only — the pages that used to sit in the desktop bar and
 * must stay one tap away. Also linked from the footer on every page. */
const more: NavItem[] = [
  { label: { mr: "मोफत साधने", en: "Free Tools" }, href: "/#tools" },
  { label: { mr: "नकाशा शोध", en: "Map Search" }, href: "/nakasha-shodh" },
  { label: { mr: "किंमत", en: "Pricing" }, href: "/pricing" },
  { label: { mr: "FAQ", en: "FAQ" }, href: "/faq" },
  { label: { mr: "मदत", en: "Support" }, href: "/support" },
];

const waCta: Record<Lang, string> = { mr: "WhatsApp करा", en: "WhatsApp us" };
const waMessage: Record<Lang, string> = {
  mr: "नमस्कार PrintShubh, मला सेवेबद्दल विचारायचे आहे.",
  en: "Hello PrintShubh, I would like to ask about a service.",
};
const menuLabel: Record<Lang, string> = { mr: "मेनू", en: "Menu" };
const moreLabel: Record<Lang, string> = { mr: "आणखी", en: "More" };

export function SiteHeader() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The dialog itself and the control that opens it — both needed by the
  // focus trap below.
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Compact-on-scroll. Passive listener + a boolean means we touch the DOM
   * only on the two frames where the state actually flips. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* The open sheet is a modal dialog, so it has to behave like one:
   *
   *   - the page behind it must not scroll,
   *   - Escape must close it,
   *   - focus must MOVE INTO it on open and stay inside while it is open,
   *   - focus must return to the trigger on close.
   *
   * The focus trap is the part that is easy to skip and expensive to omit.
   * Without it a keyboard or screen-reader user tabs straight out of the
   * sheet into the page underneath — which is both visually covered and
   * (because of the scroll lock) impossible to scroll to. */
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const sheet = sheetRef.current;
    // Captured now, not read in cleanup: by the time cleanup runs the ref
    // may already point elsewhere (or nowhere).
    const trigger = toggleRef.current;

    /* Queried fresh on each Tab rather than cached: the sheet's contents
     * change with the language toggle, and a stale list would trap focus on
     * elements that no longer exist. */
    const focusables = (): HTMLElement[] =>
      sheet
        ? Array.from(
            sheet.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : [];

    // Move focus into the sheet so the next Tab continues inside it.
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped
      // (which can happen when the sheet re-renders mid-interaction).
      if (e.shiftKey) {
        if (active === first || !sheet?.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !sheet?.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      // Hand focus back to the control that opened the sheet, so the user
      // resumes from where they were rather than at the top of the document.
      trigger?.focus();
    };
  }, [open]);

  const waHref = buildWhatsAppUrl({ message: waMessage[lang], campaign: "header" });

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-slate-200 bg-white/85 shadow-[0_1px_16px_rgba(15,23,42,0.06)] backdrop-blur-xl"
          : "border-transparent bg-white"
      }`}
    >
      <div
        className={`relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 bg-inherit px-5 transition-all duration-300 sm:px-8 ${
          scrolled ? "h-14" : "h-[68px]"
        }`}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex min-h-[44px] min-w-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 text-base font-black text-white shadow-sm">
            P
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate text-[17px] font-black tracking-tight text-slate-950">
              PRINTSHUBH
            </span>
            <span className="mt-0.5 hidden text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 sm:block">
              Jumbo Xerox
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 xl:flex">
          {primary.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-[13.5px] font-bold text-slate-700 transition after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:text-blue-800 hover:after:w-full motion-reduce:after:transition-none"
            >
              {item.label[lang]}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 text-[11px] font-black">
            {(["mr", "en"] as Lang[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                aria-label={code === "mr" ? "मराठी" : "English"}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2.5 transition ${
                  lang === code
                    ? "bg-blue-700 text-white"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {code === "mr" ? "मराठी" : "EN"}
              </button>
            ))}
          </div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppLead()}
            className="hidden h-10 items-center gap-2 rounded-lg bg-green-600 px-4 text-[13px] font-black text-white shadow-sm transition hover:bg-green-700 lg:inline-flex"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {waCta[lang]}
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={menuLabel[lang]}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-slate-300 text-slate-800 transition hover:border-blue-300 xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet sheet — full height below the bar, own scroll.
          A modal dialog: role + aria-modal tell assistive tech the rest of
          the page is inert, and the effect above enforces that for real by
          trapping focus inside. */}
      {open && (
        <div
          ref={sheetRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label={menuLabel[lang]}
          className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-slate-200 bg-white px-5 pb-28 pt-5 sm:px-8 xl:hidden ${
            // Starts flush under the bar, whichever height the bar is at.
            scrolled ? "top-14" : "top-[68px]"
          }`}
        >
        <nav aria-label={menuLabel[lang]}>
          <ul className="flex flex-col">
            {primary.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[56px] items-center border-b border-slate-100 text-[17px] font-black text-slate-900 transition active:text-blue-700"
                >
                  {item.label[lang]}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-7 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
            {moreLabel[lang]}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {more.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-[13.5px] font-bold text-slate-700 transition active:border-blue-300"
                >
                  {item.label[lang]}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackWhatsAppLead();
              setOpen(false);
            }}
            className="mt-8 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-base font-black text-white shadow-sm transition hover:bg-green-700"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            {waCta[lang]}
          </a>
        </nav>
        </div>
      )}
    </header>
  );
}
