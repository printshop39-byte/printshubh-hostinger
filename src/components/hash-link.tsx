"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

/**
 * A <Link> that also scrolls when its own "/#id" target is already in the URL.
 *
 * Next's <Link> only scrolls to a hash when the hash CHANGES, so on "/#collections"
 * a second click on a "/#collections" link does nothing (even after the visitor has
 * scrolled away). In exactly that case we scroll to the element ourselves; every other
 * click is left to Next untouched, so first clicks, other routes and plain links behave
 * exactly as a normal <Link>.
 */
export function HashLink({ onClick, href, ...rest }: ComponentProps<typeof Link>) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // The caller's handler (analytics, closing a menu) always runs first.
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const match = typeof href === "string" ? /^\/#([\w-]+)$/.exec(href) : null;
    if (!match) return; // not a "/#id" link: plain Link behaviour
    const id = match[1];

    if (window.location.pathname !== "/" || window.location.hash !== `#${id}`) return;
    const target = document.getElementById(id);
    if (!target) return; // target missing: let Next handle it

    e.preventDefault(); // stop Next's no-op navigation; URL and history stay as they are
    // Scroll after this click has been fully handled: the caller's handler may close the
    // mobile menu, and the menu then moves focus back to its button, which scrolls the page
    // and would cancel a scroll started synchronously here.
    // No `behavior`: the page's CSS scroll-behavior (smooth, or auto for reduced motion)
    // and the target's scroll-margin-top apply.
    window.setTimeout(() => target.scrollIntoView({ block: "start" }), 0);
  }

  return <Link href={href} onClick={handleClick} {...rest} />;
}
