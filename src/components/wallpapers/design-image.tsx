import type { DesignImage } from "@/lib/wallpapers/types";

/**
 * Responsive catalogue preview.
 *
 * A plain <img> with srcset on purpose: the three sizes (400 / 900 / 1600 px)
 * are produced once at upload time, so the browser picks the smallest one that
 * fits and the host's image optimizer is never involved (no per-image quota,
 * no on-demand resizing). Width/height reserve the space so nothing jumps.
 * Only previews are ever referenced here — never a production master.
 */
export function DesignImg({
  image,
  alt,
  sizes,
  eager = false,
  priority = false,
  className,
}: {
  image: DesignImage;
  alt: string;
  /** Standard `sizes` attribute: how wide the image renders at each breakpoint. */
  sizes: string;
  /** True for the first image(s) above the fold; everything else lazy-loads. */
  eager?: boolean;
  /**
   * True only for the page's main (LCP) image: it also gets fetchpriority=high.
   * Kept separate from `eager` so first-row grid cards load early without
   * competing with the hero for bandwidth. Implies eager.
   */
  priority?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized previews served with srcset, see note above
    <img
      src={image.src900}
      srcSet={`${image.src400} 400w, ${image.src900} 900w, ${image.src1600} ${image.width}w`}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={eager || priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}
