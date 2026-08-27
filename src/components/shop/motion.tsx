"use client";

/**
 * Shared motion primitives for the redesigned shop surfaces.
 *
 * Design rules baked in here so no individual section has to remember them:
 *
 *   1. prefers-reduced-motion wins, always. Every primitive collapses to its
 *      final state (visible, un-transformed) instead of animating.
 *   2. Nothing blocks interaction. Reveals animate opacity/transform only —
 *      never layout — and elements are hit-testable the whole time.
 *   3. Short. 0.4-0.7s per element, small stagger; no intro sequence the
 *      visitor has to sit through.
 *   4. Pointer effects (parallax, magnetic) attach only on devices with a
 *      real hover-capable pointer, so phones pay nothing for them.
 */

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ── Fine-pointer detection ───────────────────────────────────────────────
 * `(hover: hover) and (pointer: fine)` is the honest test for "there is a
 * mouse". It excludes phones AND excludes tablets driving a touch pointer,
 * which is exactly the boundary the brief asks for. */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return fine;
}

/** True when the visitor has asked for reduced motion (SSR-safe: false). */
export function useCalmMotion(): boolean {
  return useReducedMotion() === true;
}

/* ── Reveal ───────────────────────────────────────────────────────────────
 * Scroll-in fade + small lift, fired once. `delay` staggers siblings that
 * are not inside a <Stagger>. */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header";
}) {
  const calm = useCalmMotion();

  if (calm) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

/* ── Stagger container / item ────────────────────────────────────────────
 * Use for grids and lists: one <Stagger> wrapper, N <StaggerItem> children.
 * The container drives the timing so items never need hand-tuned delays. */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.075, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Stagger({
  children,
  className,
  as = "div",
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "ul" | "ol" | "section";
  amount?: number;
}) {
  const calm = useCalmMotion();

  if (calm) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Tag = motion[as];
  return (
    <Tag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const calm = useCalmMotion();

  if (calm) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  const Tag = motion[as];
  return (
    <Tag className={className} variants={itemVariants}>
      {children}
    </Tag>
  );
}

/* ── CountUp ──────────────────────────────────────────────────────────────
 * Counts 0 → `to` the first time it scrolls into view, then stops. Under
 * reduced motion it prints the final number immediately.
 *
 * The initial render is the FINAL value, so the real figure is what the
 * server HTML, crawlers, and no-JS visitors get; the count-down-to-zero only
 * happens on the client at the moment the animation starts. */
export function CountUp({
  to,
  duration = 1200,
  className,
  suffix = "",
  locale = "en-IN",
}: {
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  locale?: string;
}) {
  const calm = useCalmMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const [value, setValue] = useState(to);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (calm || started) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        setStarted(true);

        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          // easeOutCubic — fast first, settles gently on the real figure.
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(eased * to));
          if (p < 1) frameRef.current = requestAnimationFrame(tick);
        };
        setValue(0);
        frameRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [calm, duration, started, to]);

  // Cancel any in-flight frame on unmount so a half-finished count can't
  // call setState on a gone component.
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString(locale)}
      {suffix}
    </span>
  );
}

/* ── Magnetic ─────────────────────────────────────────────────────────────
 * Pulls a CTA a few pixels toward the cursor. Mouse-only and reduced-motion
 * aware; on every other device it renders a plain wrapper with no listeners.
 *
 * `strength` is the maximum travel in px — keep it small (6-10) or the
 * button stops feeling like a button. */
export function Magnetic({
  children,
  className,
  strength = 8,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const calm = useCalmMotion();
  const fine = useFinePointer();
  const ref = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      x.set(Math.max(-1, Math.min(1, dx)) * strength);
      y.set(Math.max(-1, Math.min(1, dy)) * strength);
    },
    [strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (calm || !fine) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: "inline-flex" }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.span>
  );
}

/* ── Pointer parallax ─────────────────────────────────────────────────────
 * Returns normalised -1…1 springs for the cursor's position inside the
 * element the handlers are attached to. When `active` is false the values
 * stay pinned at 0, so a consumer can wire them up unconditionally and let
 * the flag decide whether anything moves. */
export function usePointerParallax(active: boolean): {
  px: MotionValue<number>;
  py: MotionValue<number>;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
} {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const px = useSpring(x, { stiffness: 90, damping: 20, mass: 0.6 });
  const py = useSpring(y, { stiffness: 90, damping: 20, mass: 0.6 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!active) return;
      const r = e.currentTarget.getBoundingClientRect();
      x.set(((e.clientX - r.left) / r.width - 0.5) * 2);
      y.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    },
    [active, x, y],
  );

  const onMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { px, py, onMouseMove, onMouseLeave };
}

/** Map a -1…1 parallax value to a pixel offset. */
export function useParallaxOffset(value: MotionValue<number>, px: number) {
  return useTransform(value, [-1, 1], [-px, px]);
}
