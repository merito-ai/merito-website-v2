"use client";

import { useState } from "react";
import PriceOptionTiles from "./PriceOptionTiles";
import { formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import { trackPurchase } from "@/lib/analytics";
import { fetchWithTimeout, networkErrorMessage } from "@/lib/hub/fetchWithTimeout";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);
  if (existing) {
    return new Promise((resolve) => existing.addEventListener("load", () => resolve(), { once: true }));
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script."));
    document.body.appendChild(script);
  });
}

type Props = { onClose: () => void; onUnlocked: () => void } & (
  | { refresh?: false; leadId: string; level: CandidateLevel; bundleEligible: boolean }
  // Returning candidate buying a fresh check after a completed one, at the
  // loyalty price (server sets the amount; see lib/referenceCredits.ts).
  | { refresh: true; refreshPricePaise: number; fullPricePaise: number }
);

export default function ReferencesPaywallModal(props: Props) {
  const { onClose, onUnlocked } = props;
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheckout = async (initiateUrl: string, initiateBody: object, onPaid: () => Promise<void>) => {
    setPaying(true);
    setError(null);
    try {
      const res = await fetchWithTimeout(initiateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initiateBody),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaying(false);
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      if (data.status !== "checkout") {
        setPaying(false);
        await onPaid();
        return;
      }
      try {
        await loadRazorpayCheckoutScript();
      } catch {
        setPaying(false);
        setError("Could not load the payment form. Please try again.");
        return;
      }
      if (!window.Razorpay) {
        setPaying(false);
        setError("Could not load the payment form. Please try again.");
        return;
      }
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.orderId,
        prefill: data.prefill,
        handler: async (response) => {
          try {
            const verifyRes = await fetchWithTimeout("/api/hub/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            setPaying(false);
            if (!verifyRes.ok) {
              setError(verifyData.error || "Payment succeeded, but verification failed. Please contact support.");
              return;
            }
            trackPurchase((initiateBody as { product?: string }).product ?? "references");
            await onPaid();
          } catch (err) {
            setPaying(false);
            setError(networkErrorMessage(err, "Payment succeeded, but verification failed. Please refresh."));
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      setError(networkErrorMessage(err, "Something went wrong. Please try again."));
    }
  };

  const handlePay = (selection: "solo" | "bundle") => {
    if (selection === "bundle" && !props.refresh) {
      runCheckout("/api/hub/unlock-report", { leadId: props.leadId, product: "bundle" }, async () => onUnlocked());
    } else {
      runCheckout("/api/hub/razorpay/initiate", { product: "references" }, async () => onUnlocked());
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} className="bg-white" style={{ maxWidth: 480, width: "100%", borderRadius: 24, padding: 28, position: "relative" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9c9c9c" }}>
          ✕
        </button>
        <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 10px" }}>
          {props.refresh ? "Get fresh references" : "Unlock Reference Checks"}
        </h2>
        <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 16px" }}>
          {props.refresh
            ? "Changed company or role? Collect new references for your next move. Your current report stays on your profile until 3 new references complete."
            : "Independent ratings from people who have worked with you, across seven standard categories."}
        </p>
        {props.refresh ? (
          <>
            <div className="flex items-baseline" style={{ gap: 10, marginBottom: 4 }}>
              <span className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "2rem" }}>
                {formatPrice(props.refreshPricePaise)}
              </span>
              <span className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 15, textDecoration: "line-through" }}>
                {formatPrice(props.fullPricePaise)}
              </span>
              <span className="font-[family-name:var(--font-poppins)] font-semibold text-[#3FCB8C]" style={{ fontSize: 12.5 }}>
                {Math.round((1 - props.refreshPricePaise / props.fullPricePaise) * 100)}% off
              </span>
            </div>
            <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 12.5, margin: "0 0 16px" }}>
              Loyalty price for returning candidates.
            </p>
            <button
              type="button"
              onClick={() => handlePay("solo")}
              disabled={paying}
              className="w-full font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60"
              style={{ border: "none", borderRadius: 10, padding: "13px 16px", fontSize: 14.5, cursor: paying ? "default" : "pointer" }}
            >
              {paying ? "Opening payment…" : `Pay ${formatPrice(props.refreshPricePaise)} and start`}
            </button>
          </>
        ) : (
          <PriceOptionTiles
            soloProduct="references"
            soloLabel="Just the Reference Checks"
            level={props.level}
            bundleEligible={props.bundleEligible}
            submitting={paying}
            onContinue={handlePay}
          />
        )}
        {error && <p style={{ fontSize: 12.5, color: "#ed1a24", marginTop: 10, textAlign: "center" }}>{error}</p>}
      </div>
    </div>
  );
}
