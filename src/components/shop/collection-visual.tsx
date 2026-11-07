"use client";

/**
 * CollectionVisual — typography-first placeholder for a collection's
 * hero/grid visual.
 *
 * WHY NO PHOTO: no stock photography and no fabricated "this is what it
 * looks like" render — see the header comment on collections.ts. A
 * premium-print business shown with someone else's product photo (or an
 * AI render passed off as a real sample) undoes the trust it's meant to
 * build. This stays abstract and decorative (aria-hidden) until real
 * photos exist in Collection.photos, at which point CollectionPageShell's
 * gallery renders them instead — this component is never swapped for a
 * fake photo in the meantime.
 *
 * Visual language matches components/shop/printing-technology.tsx (the
 * 11-colour swatch strip) on purpose — both exist to look like one
 * cohesive "premium print studio" system, not two different sections
 * bolted together. Same blue/slate palette as the rest of the site; no
 * new colours introduced.
 */

import type { LucideIcon } from "lucide-react";
import {
  Brush,
  Disc3,
  Frame,
  Image as ImageIcon,
  Layers,
  PaintRoller,
  Waves,
} from "lucide-react";
import type { CollectionKey } from "@/lib/collections";

const ICONS: Record<CollectionKey, LucideIcon> = {
  "premium-wallpaper-printing": PaintRoller,
  "canvas-printing": ImageIcon,
  "wall-paintings-wall-art": Brush,
  "rexine-pu-leatherette-printing": Layers,
  "satin-fabric-printing": Waves,
  "premium-framed-prints": Frame,
  "premium-vinyl-printing": Disc3,
};

export function CollectionVisual({
  collectionKey,
  shortTitle,
  className = "",
}: {
  collectionKey: CollectionKey;
  shortTitle: string;
  className?: string;
}) {
  const Icon = ICONS[collectionKey];

  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-gold-light bg-gradient-to-br from-brand-cream via-white to-brand-cream ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#183153_1px,transparent_1px),linear-gradient(90deg,#183153_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <span className="relative grid size-16 place-items-center rounded-2xl bg-white text-brand-navy shadow-sm ring-1 ring-brand-gold-light">
        <Icon className="size-8" strokeWidth={1.75} />
      </span>
      <span className="relative mt-4 max-w-[80%] text-center text-sm font-black uppercase tracking-[0.1em] text-brand-navy/70">
        {shortTitle}
      </span>
    </div>
  );
}
