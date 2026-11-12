"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Sparkles, X } from "lucide-react";
import { FONT_BODY } from "./ui";

// Seminar users' one-time welcome line. Dismissing it (✕) is remembered per browser; the caller hides it once the
// next step is done. It is the screen's one greeting element: `fallback` (the kicker or plan badge) shows instead
// once it is gone. storageKey: "seminar" (allowlisted, no plan) or "plan" (plan holders).
const KEY = (k: string) => `merito-hub-welcome-${k}-dismissed`;

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function WelcomeLine({ storageKey, done = false, fallback = null, spaced = false, children }: { storageKey: "seminar" | "plan"; done?: boolean; fallback?: ReactNode; spaced?: boolean; children: ReactNode }) {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return window.localStorage.getItem(KEY(storageKey)) === "1";
      } catch {
        return false;
      }
    },
    () => true, // SSR can't read localStorage: render the fallback, re-sync after hydration
  );
  if (done || dismissed) return <>{fallback}</>;

  const dismiss = () => {
    try {
      window.localStorage.setItem(KEY(storageKey), "1");
    } catch {
      // storage blocked: the line just comes back next visit
    }
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div role="note" data-testid="welcome-line" className={`fv-up flex items-center bg-white/[0.05] border border-white/[0.08] text-white/80 ${FONT_BODY}`} style={{ gap: 10, borderRadius: 12, padding: "2px 2px 2px 14px", fontSize: 13.5, marginBottom: spaced ? 14 : 0 }}>
      <Sparkles size={15} strokeWidth={2} className="text-[#ff7a80] shrink-0" aria-hidden="true" />
      <span style={{ flex: 1, minWidth: 0, padding: "10px 0" }}>{children}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss welcome message"
        className="flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg shrink-0 focus-visible:outline-2 focus-visible:outline-white"
        style={{ width: 44, height: 44, background: "none", border: "none", cursor: "pointer" }}
      >
        <X size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
