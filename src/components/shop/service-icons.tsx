/**
 * ServiceIcons — small illustrated (not line/emoji) icons for the four
 * service pillars and the hero's floating document tiles.
 *
 * Each icon is a self-contained inline SVG with its own gradient, scoped to
 * the instance via `useId()` — the same icon renders more than once on a
 * page (once on the homepage pillar, again on its /service-page hero badge
 * context, again as a hero tile), and SVG gradient ids must be unique per
 * *rendered instance*, not just per icon type, or a browser can resolve a
 * `url(#id)` reference to the wrong element's gradient.
 *
 * Purely decorative: aria-hidden, no intrinsic size (sized by the parent
 * via `className`), no text content.
 */
"use client";

import { useId } from "react";

type IconProps = { className?: string };

export function PrinterIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 90" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`pi-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#55b8f2" />
          <stop offset="1" stopColor="#1677b8" />
        </linearGradient>
      </defs>
      <rect x="26" y="29" width="68" height="38" rx="9" fill={`url(#pi-${id})`} />
      <rect x="37" y="10" width="46" height="34" rx="4" fill="#fff" stroke="#dce8f1" strokeWidth="3" />
      <rect x="38" y="50" width="44" height="25" rx="4" fill="#f8fbfd" />
      <rect x="45" y="56" width="30" height="4" rx="2" fill="#b9d8ea" />
      <rect x="45" y="64" width="22" height="4" rx="2" fill="#d7e7f1" />
      <circle cx="84" cy="48" r="4" fill="#7ee0ad" />
    </svg>
  );
}

export function PhotoIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`ph-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffd27d" />
          <stop offset=".5" stopColor="#ff9f68" />
          <stop offset="1" stopColor="#e96b8b" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="76" height="76" rx="14" fill={`url(#ph-${id})`} />
      <circle cx="51" cy="42" r="15" fill="#fff" opacity=".95" />
      <path d="M24 79c5-17 18-25 27-25s22 8 27 25" fill="#fff" opacity=".95" />
      <circle cx="73" cy="27" r="5" fill="#fff" opacity=".8" />
    </svg>
  );
}

export function LandDocIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`ld-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#dcecf7" />
        </linearGradient>
      </defs>
      <path d="M27 10h34l20 20v60H27z" fill={`url(#ld-${id})`} stroke="#9ec7df" strokeWidth="4" />
      <path d="M61 10v21h20" fill="#c5e2f2" />
      <rect x="38" y="47" width="32" height="5" rx="2.5" fill="#4e9bca" />
      <rect x="38" y="59" width="25" height="5" rx="2.5" fill="#8dbbd5" />
      <rect x="38" y="71" width="29" height="5" rx="2.5" fill="#8dbbd5" />
    </svg>
  );
}

export function DigitalIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`di-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8ec9ff" />
          <stop offset="1" stopColor="#4a6fe0" />
        </linearGradient>
      </defs>
      <rect x="10" y="18" width="80" height="52" rx="8" fill={`url(#di-${id})`} />
      <rect x="18" y="26" width="64" height="36" rx="4" fill="#fff" opacity=".92" />
      <circle cx="27" cy="33" r="3" fill="#ff9f68" />
      <circle cx="36" cy="33" r="3" fill="#ffd27d" />
      <circle cx="45" cy="33" r="3" fill="#7ee0ad" />
      <rect x="24" y="42" width="52" height="4" rx="2" fill="#c9def0" />
      <rect x="24" y="50" width="36" height="4" rx="2" fill="#dbe9f4" />
      <rect x="35" y="74" width="30" height="6" rx="3" fill="#4a6fe0" />
      <rect x="25" y="82" width="50" height="5" rx="2.5" fill="#8ec9ff" />
    </svg>
  );
}

export type ServiceIconKey = "printer" | "photo" | "land" | "digital";

export const SERVICE_ICONS: Record<ServiceIconKey, (props: IconProps) => React.JSX.Element> = {
  printer: PrinterIcon,
  photo: PhotoIcon,
  land: LandDocIcon,
  digital: DigitalIcon,
};
