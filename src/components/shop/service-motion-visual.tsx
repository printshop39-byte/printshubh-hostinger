import type { ServiceGroupKey } from "@/lib/shop-services";

const frame =
  "relative h-32 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br shadow-inner";

export function ServiceMotionVisual({ service }: { service: ServiceGroupKey }) {
  if (service === "printing") {
    return (
      <div
        className={`${frame} from-sky-50 via-white to-cyan-100`}
        aria-hidden="true"
      >
        <div className="absolute -right-8 -top-10 size-28 rounded-full bg-cyan-300/30 blur-2xl" />
        <svg viewBox="0 0 260 128" className="h-full w-full">
          <rect x="66" y="45" width="128" height="61" rx="15" fill="#0f4c81" />
          <rect
            x="84"
            y="12"
            width="92"
            height="57"
            rx="7"
            fill="white"
            stroke="#bfe2f6"
            strokeWidth="3"
          />
          <g className="motion-safe:animate-[pulse_2.6s_ease-in-out_infinite]">
            <rect x="83" y="76" width="94" height="43" rx="6" fill="#fff" />
            <rect x="96" y="87" width="67" height="5" rx="2.5" fill="#70b9e2" />
            <rect x="96" y="98" width="46" height="5" rx="2.5" fill="#c6dfed" />
          </g>
          <circle
            cx="177"
            cy="63"
            r="5"
            fill="#42d392"
            className="motion-safe:animate-pulse"
          />
        </svg>
      </div>
    );
  }

  if (service === "photo") {
    return (
      <div
        className={`${frame} from-orange-50 via-white to-rose-100`}
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/35 blur-2xl motion-safe:animate-pulse" />
        <svg viewBox="0 0 260 128" className="h-full w-full">
          <g className="origin-center transition duration-500 group-hover:scale-105">
            <rect
              x="85"
              y="12"
              width="90"
              height="105"
              rx="14"
              fill="#fff"
              stroke="#fdba74"
              strokeWidth="3"
            />
            <rect x="94" y="21" width="72" height="75" rx="10" fill="#fb8b6d" />
            <circle cx="130" cy="48" r="17" fill="#fff4e8" />
            <path d="M100 91c5-23 19-32 30-32s25 9 30 32" fill="#fff4e8" />
            <rect
              x="108"
              y="103"
              width="44"
              height="5"
              rx="2.5"
              fill="#fed7aa"
            />
          </g>
          <circle
            cx="188"
            cy="29"
            r="7"
            fill="#fbbf24"
            className="motion-safe:animate-ping"
            opacity=".55"
          />
          <circle cx="188" cy="29" r="4" fill="#f59e0b" />
        </svg>
      </div>
    );
  }

  if (service === "land") {
    return (
      <div
        className={`${frame} from-blue-50 via-white to-indigo-100`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 260 128" className="h-full w-full">
          <path
            d="M84 10h62l28 28v80H84z"
            fill="white"
            stroke="#8fc5e6"
            strokeWidth="3"
          />
          <path d="M146 10v29h28" fill="#dbeafe" />
          <rect x="101" y="54" width="55" height="6" rx="3" fill="#5ba7d3" />
          <rect x="101" y="70" width="43" height="6" rx="3" fill="#b1d3e8" />
          <rect x="101" y="86" width="49" height="6" rx="3" fill="#b1d3e8" />
          <rect
            x="72"
            y="20"
            width="116"
            height="5"
            rx="2.5"
            fill="#22c55e"
            opacity=".75"
            className="motion-safe:animate-[bounce_2.4s_ease-in-out_infinite]"
          />
          <circle cx="184" cy="93" r="18" fill="#2563eb" />
          <path
            d="m176 93 6 6 11-13"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${frame} from-indigo-50 via-white to-violet-100`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 260 128" className="h-full w-full">
        <rect x="46" y="24" width="168" height="81" rx="13" fill="#243b78" />
        <rect x="57" y="35" width="146" height="58" rx="7" fill="white" />
        <circle cx="70" cy="47" r="4" fill="#fb7185" />
        <circle cx="82" cy="47" r="4" fill="#fbbf24" />
        <circle cx="94" cy="47" r="4" fill="#34d399" />
        <rect
          x="69"
          y="60"
          width="76"
          height="7"
          rx="3.5"
          fill="#93c5fd"
          className="motion-safe:animate-pulse"
        />
        <rect x="69" y="75" width="48" height="7" rx="3.5" fill="#ddd6fe" />
        <rect
          x="154"
          y="58"
          width="36"
          height="26"
          rx="7"
          fill="#6366f1"
          className="origin-center transition duration-500 group-hover:scale-110"
        />
        <path d="M100 105h60l10 12H90z" fill="#4f67a6" />
      </svg>
    </div>
  );
}
