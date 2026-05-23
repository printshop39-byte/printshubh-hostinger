"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingAnimations() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactScreen = window.matchMedia("(max-width: 640px)").matches;

    if (reducedMotion) return;

    const raf = requestAnimationFrame(() => {
      const context = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const isAboveFold = rect.top < window.innerHeight * 0.75 && rect.top >= 0;

          if (isAboveFold) {
            // Above fold: fast fade only — no blur, no y-shift (avoids LCP penalty)
            gsap.fromTo(
              el,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.35, ease: "power2.out", delay: 0.05 },
            );
          } else {
            // Below fold: scroll-triggered reveal without blur (cheaper paint)
            gsap.fromTo(
              el,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                duration: compactScreen ? 0.4 : 0.65,
                ease: "power3.out",
                y: 0,
                scrollTrigger: { once: true, start: "top 88%", trigger: el },
              },
            );
          }
        });

        if (!compactScreen) {
          gsap.to("[data-scan]", { duration: 3.2, ease: "power1.inOut", repeat: -1, xPercent: 280 });
        }
      });

      return () => {
        context.revert();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    });

    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
