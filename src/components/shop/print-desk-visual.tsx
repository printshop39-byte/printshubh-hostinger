/**
 * PrintDeskVisual — the vector composition behind the hero document cards.
 *
 * WHY A DRAWING AND NOT A PHOTO
 *   The brief rules out generic stock photography, and we have no
 *   photographs of the actual PrintShubh counter in the repo yet. A stock
 *   "modern office printer" shot would be exactly the thing to avoid: it
 *   implies a shop that isn't this one. So the hero ships an abstract,
 *   clearly-illustrative desk instead — printer, output tray, paper stack,
 *   photo strip — which promises the service without impersonating a
 *   specific place.
 *
 *   The moment real shop photos land in SHOP_PHOTOS (src/lib/shop-profile.ts)
 *   the hero swaps this drawing for the first one automatically. See
 *   <ShopHero />.
 *
 * Decorative only: aria-hidden, no text content, and every dimension is
 * viewBox-relative so it scales cleanly from 320px to 4K without a second
 * asset or a single byte of image payload.
 */
export function PrintDeskVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 420"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <defs>
        <linearGradient id="ps-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="ps-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="ps-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <filter id="ps-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="14"
            floodColor="#0f172a"
            floodOpacity="0.12"
          />
        </filter>
      </defs>

      {/* Desk surface */}
      <ellipse cx="260" cy="368" rx="212" ry="26" fill="#0f172a" opacity="0.06" />

      {/* Paper stack, left of the machine */}
      <g filter="url(#ps-soft)">
        <rect x="34" y="288" width="118" height="10" rx="3" fill="#e2e8f0" />
        <rect x="30" y="278" width="118" height="10" rx="3" fill="#eef2f7" />
        <rect x="36" y="268" width="118" height="10" rx="3" fill="#ffffff" />
      </g>

      {/* Printer body */}
      <g filter="url(#ps-soft)">
        <rect x="150" y="196" width="248" height="128" rx="18" fill="url(#ps-body)" />
        <rect
          x="150"
          y="196"
          width="248"
          height="128"
          rx="18"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        {/* Control panel */}
        <rect x="330" y="216" width="50" height="30" rx="7" fill="url(#ps-accent)" />
        <circle cx="345" cy="231" r="4" fill="#ffffff" opacity="0.9" />
        <rect x="355" y="228" width="16" height="6" rx="3" fill="#ffffff" opacity="0.7" />
        {/* Output slot */}
        <rect x="168" y="256" width="146" height="12" rx="6" fill="#0f172a" opacity="0.15" />
        {/* Front tray lip */}
        <rect x="168" y="296" width="212" height="14" rx="7" fill="#cbd5e1" />
      </g>

      {/* Sheet emerging from the output slot */}
      <g filter="url(#ps-soft)">
        <rect x="176" y="150" width="130" height="112" rx="6" fill="url(#ps-paper)" />
        <rect
          x="176"
          y="150"
          width="130"
          height="112"
          rx="6"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1.5"
        />
        {/* Abstract "printed content" — bars, never real document text */}
        <rect x="190" y="166" width="70" height="7" rx="3.5" fill="#bfdbfe" />
        <rect x="190" y="182" width="100" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="190" y="194" width="86" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="190" y="206" width="94" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="190" y="218" width="60" height="5" rx="2.5" fill="#e2e8f0" />
        <rect x="190" y="234" width="42" height="12" rx="4" fill="#2563eb" opacity="0.18" />
      </g>

      {/* Photo strip, right of the machine */}
      <g filter="url(#ps-soft)" transform="rotate(6 430 250)">
        <rect x="404" y="196" width="58" height="122" rx="6" fill="#ffffff" />
        <rect x="411" y="204" width="44" height="32" rx="3" fill="#dbeafe" />
        <rect x="411" y="242" width="44" height="32" rx="3" fill="#bfdbfe" />
        <rect x="411" y="280" width="44" height="30" rx="3" fill="#dbeafe" />
      </g>

      {/* Loose A3 sheet leaning against the desk */}
      <g filter="url(#ps-soft)" transform="rotate(-9 96 214)">
        <rect x="52" y="150" width="88" height="122" rx="5" fill="#ffffff" />
        <rect x="64" y="166" width="52" height="6" rx="3" fill="#e2e8f0" />
        <rect x="64" y="180" width="64" height="4" rx="2" fill="#eef2f7" />
        <rect x="64" y="192" width="58" height="4" rx="2" fill="#eef2f7" />
        <path
          d="M64 216 L86 200 L104 222 L120 210 L128 246 L64 246 Z"
          fill="#bfdbfe"
          opacity="0.8"
        />
      </g>
    </svg>
  );
}
