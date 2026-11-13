"use client";

import { usePlanState } from "./usePlanState";

// Blocks the Hub when the session has expired, so nobody acts on prices or a Pay button that would fail.
export default function SessionExpiredNotice() {
  if (!usePlanState().expired) return null;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div className="bg-white font-[family-name:var(--font-poppins)]" style={{ maxWidth: 400, width: "100%", borderRadius: 24, padding: 28, textAlign: "center" }}>
        <h2 id="session-expired-title" className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.3rem", margin: "0 0 16px" }}>
          Your session expired. Sign in again
        </h2>
        <a
          href={`/hub/login?next=${next}`}
          className="inline-flex items-center justify-center w-full font-semibold text-white"
          style={{ height: 50, borderRadius: 8, fontSize: 15, background: "#ed1a24", textDecoration: "none" }}
        >
          Sign in
        </a>
      </div>
    </div>
  );
}
