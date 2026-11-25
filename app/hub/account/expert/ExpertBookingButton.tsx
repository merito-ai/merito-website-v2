"use client";

import { useEffect, useRef, useState } from "react";
import CounsellingPaywallModal from "../CounsellingPaywallModal";
import { buildCalendlyUrl } from "@/lib/hub/calendlyUrl";
import { useHubUser } from "../HubUserContext";

// Shared button + paywall-modal trigger for the expert-guidance page's two
// booking CTAs (the card under the bio, and the closing gradient CTA card).
// Extracted from ExpertBookingCard so both placements share one booking flow
// instead of each wiring its own modal state.
// Calendly opens as an in-page popup (official widget); the plain link stays as the fallback if the script fails.
// With a sessionId (Plan 2 mentoring row) the booking is posted back so the session shows as scheduled.
const WIDGET = "https://assets.calendly.com/assets/external/widget";
type CalendlyWidget = { initPopupWidget: (o: { url: string }) => void };

function loadCalendlyWidget() {
  if (document.querySelector(`script[src="${WIDGET}.js"]`)) return;
  const css = Object.assign(document.createElement("link"), { rel: "stylesheet", href: `${WIDGET}.css` });
  const js = Object.assign(document.createElement("script"), { src: `${WIDGET}.js`, async: true });
  document.head.append(css, js);
}

export default function ExpertBookingButton({
  priceLabel,
  initialRequested,
  sessionId,
}: {
  priceLabel: string;
  initialRequested: boolean;
  sessionId?: string | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [requested, setRequested] = useState(initialRequested);
  const hubUser = useHubUser();
  const opened = useRef(false); // only the button that opened the popup reports the booking

  useEffect(() => {
    if (!requested) return;
    loadCalendlyWidget();
    if (!sessionId) return;
    const onMessage = async (e: MessageEvent) => {
      if (!opened.current || e.origin !== "https://calendly.com" || e.data?.event !== "calendly.event_scheduled") return;
      const { event, invitee } = e.data.payload ?? {};
      await fetch(`/api/hub/counselling/${sessionId}/booked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_uri: event?.uri, invitee_uri: invitee?.uri }),
      }).catch(() => null); // a miss is picked up by the page-render sync
      window.location.reload();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [requested, sessionId]);

  const bookingUrl = buildCalendlyUrl(hubUser, sessionId);

  if (requested) {
    return (
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            const calendly = (window as unknown as { Calendly?: CalendlyWidget }).Calendly;
            if (!calendly) return; // widget not loaded: the link opens Calendly in a new tab
            e.preventDefault();
            opened.current = true;
            calendly.initPopupWidget({ url: bookingUrl });
          }}
          className="font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
          style={{ borderRadius: 8, padding: "12px 20px", fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap", display: "inline-block", textDecoration: "none" }}
        >
          Schedule your call →
        </a>
        <span className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 11.5, color: "#9c9c9c" }}>
          Usually confirmed within 48 hours
        </span>
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
        style={{ border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 13.5, cursor: "pointer", whiteSpace: "nowrap" }}
      >
        Book my expert call for {priceLabel}
      </button>

      {modalOpen && (
        <CounsellingPaywallModal
          priceLabel={priceLabel}
          onClose={() => setModalOpen(false)}
          onRequested={() => {
            setModalOpen(false);
            setRequested(true);
          }}
        />
      )}
    </>
  );
}
