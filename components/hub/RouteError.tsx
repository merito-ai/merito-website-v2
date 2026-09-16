"use client";

import { useEffect } from "react";

// Shared Next.js error.tsx UI for hub/account route segments.
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Hub route error:", error);
  }, [error]);

  return (
    <div
      style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center", padding: 20 }}
    >
      <p className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.1rem" }}>
        Something went wrong.
      </p>
      <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 13, maxWidth: 360 }}>
        This page hit an error loading. Try again, or refresh if it keeps happening.
      </p>
      <button
        onClick={reset}
        className="font-[family-name:var(--font-poppins)] font-semibold"
        style={{ background: "#ed1a24", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13.5, cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
