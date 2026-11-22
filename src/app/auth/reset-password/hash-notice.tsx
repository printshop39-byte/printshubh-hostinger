"use client";

/**
 * Reads the URL FRAGMENT (which servers never see) on the reset page's error
 * states. Supabase's older "implicit" links report problems there, e.g.
 *   /auth/callback#error=access_denied&error_code=otp_expired
 * The callback redirects here with the fragment intact; this shows the right
 * message and then scrubs the fragment from the address bar / history.
 *
 * A fragment carrying an access_token is never used: tokens are only accepted
 * server-side through /auth/callback.
 */

import { useEffect, useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const clientHash = () => window.location.hash;
const serverHash = () => "";

export function HashNotice() {
  const hash = useSyncExternalStore(subscribe, clientHash, serverHash);

  // Scrub only AFTER the fragment has been read and rendered (replaceState does
  // not fire `hashchange`, so the message stays on screen).
  useEffect(() => {
    if (hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [hash]);

  if (!hash) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  let message: string | null = null;
  if (params.get("error_code") === "otp_expired") {
    message = "ही रीसेट लिंक कालबाह्य झाली आहे किंवा आधीच वापरली गेली आहे.";
  } else if (params.get("error") || params.get("error_description")) {
    message = "ही रीसेट लिंक अवैध आहे.";
  } else if (params.get("access_token") || params.get("type") === "recovery") {
    message = "ही लिंक या पद्धतीने वापरता येत नाही. कृपया खालून नवीन रीसेट लिंक मागवा.";
  }
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700"
    >
      {message}
    </p>
  );
}
