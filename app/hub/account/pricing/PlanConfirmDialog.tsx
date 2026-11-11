"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import type { PlanConfirm } from "./pricingCatalog";

// Same overlay/card pattern as the account paywall modals, plus a focus trap: Esc closes, focus returns to the trigger on unmount.
export default function PlanConfirmDialog({ content, onConfirm, onCancel }: { content: PlanConfirm; onConfirm: () => void; onCancel: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => trigger?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
      return;
    }
    if (e.key !== "Tab") return;
    const items = panelRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])");
    if (!items?.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const btn = "w-full sm:flex-1 font-[family-name:var(--font-poppins)] font-semibold";
  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="plan-confirm-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="bg-white font-[family-name:var(--font-poppins)] outline-none"
        style={{ maxWidth: 460, width: "100%", borderRadius: 24, padding: 24, maxHeight: "92vh", overflowY: "auto" }}
      >
        <h2 id="plan-confirm-title" className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.3rem", margin: "0 0 14px" }}>
          {content.title}
        </h2>
        <p className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: 16, margin: 0 }}>
          {content.name}
        </p>
        <p className="font-[family-name:var(--font-gabarito)] font-bold text-black" style={{ fontSize: 30, lineHeight: 1.2, margin: "2px 0 0" }}>
          {content.priceLabel}
        </p>
        <p className="text-[#6b6b6d]" style={{ fontSize: 12.5, margin: "2px 0 16px" }}>
          One-time payment · no expiry
        </p>

        <p className="font-semibold text-black" style={{ fontSize: 13, margin: "0 0 8px" }}>
          What&apos;s included
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {content.rows.map((r) => (
            <li key={r.label} className="flex text-[#2b2b2d]" style={{ gap: 8, fontSize: 13, lineHeight: 1.45 }}>
              <Check size={16} strokeWidth={2.5} className="text-[#16803c] shrink-0" style={{ marginTop: 2 }} aria-hidden="true" />
              <span>
                {r.label}
                {r.helper && <span className="block text-[#6b6b6d]" style={{ fontSize: 12 }}>{r.helper}</span>}
              </span>
            </li>
          ))}
        </ul>

        {content.alreadyOwned && (
          <p className="text-[#6b6b6d] bg-[#f4f4f5]" style={{ fontSize: 12, lineHeight: 1.55, borderRadius: 10, padding: "10px 12px", margin: "0 0 16px" }}>
            You already have: {content.alreadyOwned}. The plan price stays the same and these purchases aren&apos;t credited.
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row" style={{ gap: 8 }}>
          <button type="button" onClick={onCancel} className={`${btn} text-black bg-white border border-[#dcdcdc] hover:border-[#9c9c9c]`} style={{ minHeight: 44, borderRadius: 8, fontSize: 14, cursor: "pointer" }}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={`${btn} text-white bg-[#ed1a24] hover:bg-[#c8151e]`} style={{ minHeight: 44, borderRadius: 8, fontSize: 14, border: "none", cursor: "pointer" }}>
            Continue to payment
          </button>
        </div>
      </div>
    </div>
  );
}
