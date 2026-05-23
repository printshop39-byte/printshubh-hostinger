"use client";

import { useLang } from "@/components/language-context";

/* ──────────────────────────────────────────────────────────────────────────────
   HeroMotionBackground
   Premium, Welta.ai-inspired motion background for the PrintShubh hero.
   - CSS/SVG only — no WebGL, no JS animation loops
   - Light off-white / soft blue / soft green gradient
   - Subtle grid, floating blurred blobs, orbit lines, animated service nodes,
     faint Maharashtra silhouette, dotted route line, route chip
   - pointer-events: none on every layer so the hero stays interactive
   - Respects prefers-reduced-motion
   - Mobile: heavier layers hidden via Tailwind responsive classes
   ────────────────────────────────────────────────────────────────────────────── */

export function HeroMotionBackground() {
  const { lang } = useLang();

  /* Labels for service nodes / route chips */
  const nodes =
    lang === "mr"
      ? [
          { label: "7/12", top: "16%", left: "6%", delay: "0s", tone: "blue" as const },
          { label: "8A", top: "60%", left: "10%", delay: "1.4s", tone: "indigo" as const },
          { label: "गाव नकाशा", top: "10%", right: "8%", delay: "0.7s", tone: "green" as const },
          { label: "DP Map", top: "56%", right: "6%", delay: "2.1s", tone: "sky" as const },
          { label: "मिळकत पत्रिका", top: "82%", left: "42%", delay: "1.0s", tone: "blue" as const },
        ]
      : [
          { label: "7/12", top: "16%", left: "6%", delay: "0s", tone: "blue" as const },
          { label: "8A", top: "60%", left: "10%", delay: "1.4s", tone: "indigo" as const },
          { label: "Village Map", top: "10%", right: "8%", delay: "0.7s", tone: "green" as const },
          { label: "DP Map", top: "56%", right: "6%", delay: "2.1s", tone: "sky" as const },
          { label: "Property Card", top: "82%", left: "42%", delay: "1.0s", tone: "blue" as const },
        ];

  const floatingCards =
    lang === "mr"
      ? [
          { label: "जिल्हा", top: "24%", left: "2%", delay: "0s", tone: "blue" as const },
          { label: "तालुका", top: "70%", left: "3%", delay: "0.6s", tone: "indigo" as const },
          { label: "गाव", top: "22%", right: "2%", delay: "1.2s", tone: "green" as const },
          { label: "सेवा", top: "72%", right: "3%", delay: "1.8s", tone: "sky" as const },
        ]
      : [
          { label: "District", top: "24%", left: "2%", delay: "0s", tone: "blue" as const },
          { label: "Taluka", top: "70%", left: "3%", delay: "0.6s", tone: "indigo" as const },
          { label: "Village", top: "22%", right: "2%", delay: "1.2s", tone: "green" as const },
          { label: "Service", top: "72%", right: "3%", delay: "1.8s", tone: "sky" as const },
        ];

  const routeChipText =
    lang === "mr"
      ? "जिल्हा → तालुका → गाव"
      : "District → Taluka → Village";

  return (
    <div
      aria-hidden="true"
      className="hero-motion-bg pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* ── Base gradient (very light off-white → soft blue → soft green) ── */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_42%,#f0fdf4_100%)]" />

      {/* ── Radial gradient circles (soft, behind hero card) ── */}
      <div className="absolute -left-[10%] top-[8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.22),transparent_65%)]" />
      <div className="absolute -right-[8%] top-[14%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.18),transparent_65%)]" />
      <div className="absolute bottom-[-12%] left-[28%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_65%)]" />

      {/* ── Subtle grid pattern ── */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,99,235,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(37,99,235,0.06)_1px,transparent_1px)] bg-[size:42px_42px] opacity-70" />

      {/* ── Floating blurred gradient blobs (mobile-light) ── */}
      <div className="hero-blob hero-blob-a absolute -left-24 top-10 hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.28),rgba(59,130,246,0)_70%)] sm:block" />
      <div className="hero-blob hero-blob-b absolute right-[-6rem] top-[18%] hidden h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.22),rgba(34,197,94,0)_70%)] sm:block" />
      <div className="hero-blob hero-blob-c absolute left-1/3 bottom-[-6rem] hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.22),rgba(14,165,233,0)_70%)] md:block" />

      {/* ── Faint Maharashtra silhouette (right/back, low opacity) ── */}
      <svg
        viewBox="0 0 1000 700"
        className="absolute right-[-6%] top-[12%] hidden h-[78%] w-auto opacity-[0.10] md:block"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="mh-silhouette" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <path
          d="M 120 360 L 150 300 L 200 250 L 260 215 L 320 200 L 380 200 L 440 215 L 520 220 L 600 240 L 680 260 L 760 285 L 820 320 L 870 365 L 890 420 L 880 470 L 850 520 L 810 555 L 760 580 L 700 595 L 640 605 L 580 610 L 520 605 L 460 600 L 400 600 L 340 595 L 290 580 L 240 555 L 200 520 L 165 480 L 140 435 L 125 395 Z"
          fill="url(#mh-silhouette)"
          stroke="rgba(37,99,235,0.35)"
          strokeWidth="2"
        />
      </svg>

      {/* ── Orbit / connection lines (SVG, animated dash) ── */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        className="absolute inset-0 hidden h-full w-full sm:block"
      >
        <defs>
          <linearGradient id="orbit-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.0" />
            <stop offset="50%" stopColor="#2563eb" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="orbit-green" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.0" />
            <stop offset="50%" stopColor="#16a34a" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Diagonal orbit line — from village node area to service area */}
        <path
          d="M 120 720 Q 600 360 1480 180"
          fill="none"
          stroke="url(#orbit-blue)"
          strokeWidth="1.2"
        />
        <path
          d="M 80 200 Q 700 540 1520 720"
          fill="none"
          stroke="url(#orbit-green)"
          strokeWidth="1.2"
        />

        {/* Animated dotted route line (village → service) */}
        <path
          d="M 200 760 Q 800 420 1420 220"
          fill="none"
          stroke="#2563eb"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeDasharray="2 10"
          strokeLinecap="round"
          className="hero-route-dash"
        />

        {/* Subtle ring around center */}
        <circle
          cx="800"
          cy="460"
          r="280"
          fill="none"
          stroke="rgba(37,99,235,0.10)"
          strokeWidth="1"
          strokeDasharray="1 6"
        />
        <circle
          cx="800"
          cy="460"
          r="420"
          fill="none"
          stroke="rgba(22,163,74,0.08)"
          strokeWidth="1"
          strokeDasharray="1 8"
        />
      </svg>

      {/* ── Floating service node pills with pulse rings ── */}
      {nodes.map((n) => (
        <div
          key={n.label}
          className={`hero-node hero-tone-${n.tone} absolute hidden sm:block`}
          style={{
            top: n.top,
            left: n.left,
            right: n.right,
            animationDelay: n.delay,
          }}
        >
          <span className="hero-node-pulse" />
          <span className="hero-node-pill">
            <span className="hero-node-dot" />
            {n.label}
          </span>
        </div>
      ))}

      {/* ── Floating mini cards: District / Taluka / Village / Service ── */}
      {floatingCards.map((c) => (
        <div
          key={c.label}
          className={`hero-mini-card hero-tone-${c.tone} absolute hidden lg:block`}
          style={{
            top: c.top,
            left: c.left,
            right: c.right,
            animationDelay: c.delay,
          }}
        >
          <span className="hero-mini-card-eyebrow" />
          <span>{c.label}</span>
        </div>
      ))}

      {/* ── Route chip: जिल्हा → तालुका → गाव ── */}
      <div className="hero-route-chip absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:block">
        {routeChipText}
      </div>

      {/* ── Local styles — animations, prefers-reduced-motion, mobile ── */}
      <style jsx>{`
        /* Floating blobs — tiny drift via transform only */
        .hero-blob {
          will-change: transform, opacity;
        }
        .hero-blob-a {
          animation: heroDriftA 18s ease-in-out infinite;
        }
        .hero-blob-b {
          animation: heroDriftB 22s ease-in-out infinite;
        }
        .hero-blob-c {
          animation: heroDriftC 26s ease-in-out infinite;
        }

        /* Dotted route — dash march */
        .hero-route-dash {
          animation: heroDashMarch 9s linear infinite;
        }

        /* Service node pills — glassmorphism, slow drift, hover glow */
        .hero-node {
          transform: translate3d(0, 0, 0);
          animation: heroNodeFloat 9s ease-in-out infinite;
          pointer-events: auto;
        }
        .hero-node-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.85rem;
          border-radius: 999px;
          font-size: 0.74rem;
          font-weight: 800;
          color: #1e3a8a;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(37, 99, 235, 0.22);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.85) inset,
            0 10px 28px -16px rgba(15, 23, 42, 0.25);
          backdrop-filter: blur(8px) saturate(140%);
          -webkit-backdrop-filter: blur(8px) saturate(140%);
          letter-spacing: 0.01em;
          transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }
        .hero-node:hover .hero-node-pill {
          transform: translateY(-2px) scale(1.05);
          border-color: rgba(37, 99, 235, 0.45);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.9) inset,
            0 18px 40px -16px rgba(37, 99, 235, 0.35),
            0 0 0 4px rgba(96, 165, 250, 0.18);
        }
        .hero-node-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.18);
        }
        .hero-node-pulse {
          position: absolute;
          inset: -12px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(37, 99, 235, 0.20),
            rgba(37, 99, 235, 0) 70%
          );
          animation: heroNodePulse 3.6s ease-in-out infinite;
          opacity: 0.7;
          z-index: -1;
        }

        /* Tone variants — each pill gets a distinct accent */
        .hero-tone-blue .hero-node-pill {
          color: #1d4ed8;
          border-color: rgba(37, 99, 235, 0.25);
        }
        .hero-tone-blue .hero-node-dot {
          background: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
        }
        .hero-tone-blue .hero-node-pulse {
          background: radial-gradient(circle, rgba(37, 99, 235, 0.22), rgba(37, 99, 235, 0) 70%);
        }

        .hero-tone-indigo .hero-node-pill {
          color: #3730a3;
          border-color: rgba(99, 102, 241, 0.28);
        }
        .hero-tone-indigo .hero-node-dot {
          background: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
        }
        .hero-tone-indigo .hero-node-pulse {
          background: radial-gradient(circle, rgba(99, 102, 241, 0.22), rgba(99, 102, 241, 0) 70%);
        }

        .hero-tone-green .hero-node-pill {
          color: #15803d;
          border-color: rgba(22, 163, 74, 0.28);
        }
        .hero-tone-green .hero-node-dot {
          background: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.18);
        }
        .hero-tone-green .hero-node-pulse {
          background: radial-gradient(circle, rgba(22, 163, 74, 0.22), rgba(22, 163, 74, 0) 70%);
        }

        .hero-tone-sky .hero-node-pill {
          color: #075985;
          border-color: rgba(14, 165, 233, 0.28);
        }
        .hero-tone-sky .hero-node-dot {
          background: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
        }
        .hero-tone-sky .hero-node-pulse {
          background: radial-gradient(circle, rgba(14, 165, 233, 0.22), rgba(14, 165, 233, 0) 70%);
        }

        /* Floating mini cards (District / Taluka / Village / Service) */
        .hero-mini-card {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.6rem 0.95rem;
          border-radius: 0.85rem;
          font-size: 0.78rem;
          font-weight: 800;
          color: #0f172a;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.28);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.8) inset,
            0 16px 32px -20px rgba(15, 23, 42, 0.22);
          backdrop-filter: blur(10px) saturate(135%);
          -webkit-backdrop-filter: blur(10px) saturate(135%);
          animation: heroNodeFloat 11s ease-in-out infinite;
          pointer-events: auto;
          transition:
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 0.35s ease,
            border-color 0.35s ease;
        }
        .hero-mini-card:hover {
          transform: translateY(-2px);
          border-color: rgba(37, 99, 235, 0.4);
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.9) inset,
            0 20px 36px -16px rgba(37, 99, 235, 0.30);
        }
        .hero-mini-card-eyebrow {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
        }
        .hero-tone-blue   .hero-mini-card-eyebrow { background: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.18); }
        .hero-tone-indigo .hero-mini-card-eyebrow { background: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.18); }
        .hero-tone-green  .hero-mini-card-eyebrow { background: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.18); }
        .hero-tone-sky    .hero-mini-card-eyebrow { background: #0ea5e9; box-shadow: 0 0 0 3px rgba(14,165,233,0.18); }

        /* Route chip */
        .hero-route-chip {
          padding: 0.4rem 0.9rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: 0.08em;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(37, 99, 235, 0.22);
          box-shadow: 0 12px 28px -18px rgba(15, 23, 42, 0.22);
        }

        /* ── Keyframes — opacity/translate/scale only (no filter/blur anim) ── */
        @keyframes heroDriftA {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(20px, -14px, 0) scale(1.04);
          }
        }
        @keyframes heroDriftB {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-18px, 22px, 0) scale(1.05);
          }
        }
        @keyframes heroDriftC {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(14px, -22px, 0) scale(1.03);
          }
        }
        @keyframes heroNodeFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }
        @keyframes heroNodePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.25;
          }
        }
        @keyframes heroDashMarch {
          to {
            stroke-dashoffset: -240;
          }
        }

        /* ── Mobile: keep background simple ── */
        @media (max-width: 640px) {
          .hero-route-dash {
            animation: none;
          }
        }

        /* ── Respect prefers-reduced-motion ── */
        @media (prefers-reduced-motion: reduce) {
          .hero-blob,
          .hero-node,
          .hero-mini-card,
          .hero-route-dash,
          .hero-node-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
