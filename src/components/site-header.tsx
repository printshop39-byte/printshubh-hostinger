"use client";

/**
 * SiteHeader — sticky top bar used on every route (homepage, service page
 * shells, legal page shell).
 *
 * Structure: brand wordmark · primary nav · search · WhatsApp CTA. (There is no
 * language toggle: the public site is English-only.)
 *
 * The nav is split into `primary` and `more`:
 *   - primary  — the four service categories plus About/Contact. These are
 *                what the shop wants a first-time visitor to see, so they
 *                get the desktop bar.
 *   - more     — the counter services, FAQ and support. Still one tap away
 *                in the mobile sheet and always present in the footer.
 *
 * Scroll behaviour: past ~12px the bar loses a little height, gains a blur
 * and a stronger border. It is a CSS transition on a boolean, not a
 * scroll-linked animation, so it costs one class swap and no rAF loop.
 */

import Link from "next/link";
import { HashLink } from "@/components/hash-link";
import { useEffect, useRef, useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { trackWhatsAppLead } from "@/components/meta-pixel";
import { SiteSearch } from "@/components/site-search";
import { announceOverlay, closeWhenOtherOpens } from "@/lib/overlay-bus";

interface NavItem {
  label: string;
  href: string;
}

/* Shown in the desktop bar AND at the top of the mobile sheet.
 *
 * Stage-4 rebrand (owner decision): the desktop bar now reads Home,
 * Collections, About, Contact only — the Premium Studio identity, not a
 * service-centre list. Printing & Xerox / Photo / Digital Services moved
 * into `more` below: still one tap away in the mobile sheet and still
 * linked from the footer on every page, so nothing stopped being
 * reachable — this is a navigation-prominence change only. */
const primary: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/#collections" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

/* Mobile sheet only — the pages that used to sit in the desktop bar and
 * must stay one tap away. Also linked from the footer on every page. */
const more: NavItem[] = [
  { label: "Printing & Xerox", href: "/printing-xerox" },
  { label: "Photo", href: "/photo-services" },
  { label: "Online Services", href: "/digital-services" },
  { label: "FAQ", href: "/faq" },
  { label: "Support", href: "/support" },
];

const waCta: string = "WhatsApp us";
const waMessage: string = "Hello PrintShubh, I would like to ask about a service.";
const menuLabel: string = "Menu";
const moreLabel: string = "More";

export function SiteHeader() {
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

  // The search overlay opened (button, "/" or Ctrl+K): close the menu so only one is ever open.
  useEffect(() => closeWhenOtherOpens("menu", () => setOpen(false)), []);

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

    /* Lock the page scroll on <html>, not <body>: an inline overflow on <body>
     * turns it back into a scroll container, which stops the sticky header from
     * sticking and makes the page jump while the sheet is open. */
    const root = document.documentElement;
    const previous = root.style.overflow;
    const previousPadding = root.style.paddingRight;
    // Hiding the scrollbar reflows the page and moves the scroll position (tablet and small
    // desktop widths); padding of the same width keeps everything where it was.
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`;

    const sheet = sheetRef.current;
    // Captured now, not read in cleanup: by the time cleanup runs the ref
    // may already point elsewhere (or nowhere).
    const trigger = toggleRef.current;

    /* Queried fresh on each Tab rather than cached: a stale list would trap
     * focus on elements that no longer exist. */
    const focusables = (): HTMLElement[] =>
      sheet
        ? Array.from(
            sheet.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => el.offsetParent !== null)
        : [];

    // Move focus into the sheet so the next Tab continues inside it. preventScroll:
    // the header is sticky now, so without it the page would jump to the top.
    focusables()[0]?.focus({ preventScroll: true });

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
      root.style.overflow = previous;
      root.style.paddingRight = previousPadding;
      window.removeEventListener("keydown", onKey);
      // Hand focus back to the control that opened the sheet, so the user
      // resumes from where they were rather than at the top of the document.
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  const waHref = buildWhatsAppUrl({ message: waMessage, campaign: "header" });

  return (
    <header
      data-site-chrome=""
      data-surface="dark"
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? // backdrop-filter makes the header the containing block of the position:fixed
            // menu sheet inside it (the sheet would shrink to the header), so it is dropped
            // while the menu is open.
            `border-brand-gold/60 bg-forest/95 shadow-[0_6px_24px_rgba(10,43,33,0.35)]${open ? "" : " backdrop-blur-xl"}`
          : "border-brand-gold/35 bg-forest"
      }`}
    >
      <div
        className={`relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-2 bg-inherit px-4 transition-all duration-300 sm:gap-3 sm:px-8 ${
          scrolled ? "h-14" : "h-[68px]"
        }`}
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex min-h-[44px] min-w-0 items-center gap-2 sm:gap-2.5"
          onClick={() => setOpen(false)}
        >
          {/* Official PRINTSHUBH logo: the supplied emblem and wordmark on the brand
              green, pre-rendered at 1x / 2x / 3x so it stays sharp on every
              screen. Its width/height attributes reserve the exact space (no
              layout shift); the height classes only scale it uniformly. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand asset with three pre-rendered densities */}
          <img
            src="/brand/header-lockup.png"
            srcSet="/brand/header-lockup.png 1x, /brand/header-lockup@2x.png 2x, /brand/header-lockup@3x.png 3x"
            width={237}
            height={44}
            alt="PRINTSHUBH"
            decoding="async"
            className="h-10 w-auto max-w-none shrink-0 max-[370px]:h-9 max-[340px]:h-8 max-[310px]:h-7 sm:h-11"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-6 xl:flex">
          {primary.slice(1).map((item) => (
            <HashLink
              key={item.href}
              href={item.href}
              className="relative inline-flex min-h-[44px] items-center text-[14px] font-semibold text-ivory transition after:absolute after:bottom-2.5 after:left-0 after:h-[2px] after:w-0 after:bg-brand-gold after:transition-all after:duration-300 hover:text-brand-gold hover:after:w-full motion-reduce:after:transition-none"
            >
              {item.label}
            </HashLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <SiteSearch />

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppLead()}
            className="btn btn-primary hidden h-11 px-4 text-[13.5px] lg:inline-flex"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {waCta}
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => {
              const next = !open;
              setOpen(next);
              if (next) announceOverlay("menu");
            }}
            aria-label={menuLabel}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-ivory/35 text-ivory transition hover:border-brand-gold hover:text-brand-gold xl:hidden"
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
          aria-label={menuLabel}
          className={`fixed inset-x-0 bottom-0 z-40 overflow-y-auto border-t border-brand-gold/40 bg-forest px-5 pb-28 pt-5 sm:px-8 xl:hidden ${
            // Starts flush under the bar, whichever height the bar is at.
            scrolled ? "top-14" : "top-[68px]"
          }`}
        >
        <nav aria-label={menuLabel}>
          <ul className="flex flex-col">
            {primary.map((item) => (
              <li key={item.href}>
                <HashLink
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[56px] items-center border-b border-ivory/15 font-display text-[19px] font-normal text-ivory transition active:text-brand-gold"
                >
                  {item.label}
                </HashLink>
              </li>
            ))}
          </ul>

          <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
            {moreLabel}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {more.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-ivory/30 px-4 text-[14px] font-medium text-ivory transition active:border-brand-gold"
                >
                  {item.label}
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
            className="btn btn-primary btn-lg mt-8 w-full"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            {waCta}
          </a>
        </nav>
        </div>
      )}
    </header>
  );
}
