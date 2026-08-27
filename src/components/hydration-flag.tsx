"use client";

/**
 * HydrationFlag — stamps `data-hydrated` on <html> once React is running.
 *
 * It exists for exactly one consumer: the reveal-fallback script in
 * src/app/layout.tsx.
 *
 * Framer Motion serialises its `initial` state into the server HTML, so every
 * scroll-revealed section ships as `style="opacity:0;…"` and depends on
 * hydration to become visible. The fallback script needs to distinguish two
 * cases that look identical in the DOM:
 *
 *   1. hydration worked, and a section is still opacity:0 because the visitor
 *      has not scrolled to it yet  → leave it alone,
 *   2. hydration never happened     → reveal everything.
 *
 * This flag is the only reliable signal for that difference. Without it the
 * fallback would rip the reveal animation off the page for anyone who paused
 * a few seconds before scrolling.
 */

import { useEffect } from "react";

export function HydrationFlag() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);

  return null;
}
