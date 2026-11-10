"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus } from "lucide-react";
import { trackPurchase } from "@/lib/analytics";
import { fetchWithTimeout, networkErrorMessage } from "@/lib/hub/fetchWithTimeout";
import type { PlanCard } from "./pricingCatalog";

// Checkout copied verbatim from PersonalityPaywallModal.tsx (repo's per-modal pattern; see plan "Deferred").
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

const EYEBROW = "font-[family-name:var(--font-poppins)] font-bold uppercase text-white/40";

export default function PlanCardsClient({ plans }: { plans: PlanCard[] }) {
  const router = useRouter();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<{ product: string; message: string } | null>(null);

  const runCheckout = async (product: string) => {
    const initiateBody = { product };
    const fail = (message: string) => {
      setPaying(null);
      setError({ product, message });
    };
    const onPaid = async () => router.refresh();
    setPaying(product);
    setError(null);
    try {
      const res = await fetchWithTimeout("/api/hub/razorpay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initiateBody),
      });
      const data = await res.json();
      if (!res.ok) {
        fail(data.error || "Something went wrong. Please try again.");
        return;
      }
      if (data.status !== "checkout") {
        setPaying(null);
        await onPaid();
        return;
      }
      try {
        await loadRazorpayCheckoutScript();
      } catch {
        fail("Could not load the payment form. Please try again.");
        return;
      }
      if (!window.Razorpay) {
        fail("Could not load the payment form. Please try again.");
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
            setPaying(null);
            if (!verifyRes.ok) {
              setError({ product, message: verifyData.error || "Payment succeeded, but verification failed. Please contact support." });
              return;
            }
            trackPurchase(product);
            await onPaid();
          } catch (err) {
            fail(networkErrorMessage(err, "Payment succeeded, but verification failed. Please refresh."));
          }
        },
        modal: { ondismiss: () => setPaying(null) },
      });
      rzp.open();
    } catch (err) {
      fail(networkErrorMessage(err, "Something went wrong. Please try again."));
    }
  };

  return (
    <main>
      <div className="mx-auto" style={{ maxWidth: 1040, padding: "28px 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <p className={EYEBROW} style={{ fontSize: 10.5, letterSpacing: "0.08em", margin: "0 0 6px" }}>
            Account
          </p>
          <h1 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.7rem", margin: 0 }}>
            Your Merito plans
          </h1>
          <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 13.5, margin: "6px 0 0" }}>
            One payment, no expiry. Each feature can be used once.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
          {plans.map((plan) => (
            <div key={plan.product} className="bg-[#141416] border border-white/[0.08] flex flex-col" style={{ borderRadius: 14, padding: 20 }}>
              <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 16, margin: "0 0 6px" }}>
                {plan.title}
              </h3>
              <span className="font-[family-name:var(--font-gabarito)] font-bold text-white" style={{ fontSize: 24, marginBottom: 14 }}>
                {plan.priceLabel}
              </span>

              <ul className="font-[family-name:var(--font-poppins)]" style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {plan.lines.map((line) => (
                  <li key={line.label} className="flex items-start" style={{ gap: 8, fontSize: 13 }}>
                    {line.included ? (
                      <Check size={15} strokeWidth={2.5} className="text-[#3FCB8C] shrink-0" style={{ marginTop: 2 }} aria-label="Included" />
                    ) : (
                      <Minus size={15} strokeWidth={2} className="text-white/25 shrink-0" style={{ marginTop: 2 }} aria-label="Not included" />
                    )}
                    <span className={line.included ? "text-white/80" : "text-white/35"} style={{ flex: 1 }}>
                      {line.label}
                    </span>
                    <span className="text-white/35" style={{ fontSize: 12 }}>
                      {line.valueLabel}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.footnote && (
                <p className="font-[family-name:var(--font-poppins)] text-white/45" style={{ fontSize: 11.5, lineHeight: 1.6, margin: "0 0 16px" }}>
                  {plan.footnote}
                </p>
              )}

              <button
                onClick={() => runCheckout(plan.product)}
                disabled={paying !== null}
                className="text-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60"
                style={{ borderRadius: 8, padding: "11px 16px", fontSize: 13.5, border: "none", cursor: paying ? "default" : "pointer" }}
              >
                {paying === plan.product ? "Opening payment…" : `Buy for ${plan.priceLabel} →`}
              </button>
              {error?.product === plan.product && (
                <p role="alert" style={{ fontSize: 12.5, color: "#ed1a24", margin: "10px 0 0", textAlign: "center" }}>
                  {error.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="font-[family-name:var(--font-poppins)] text-white/40" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
          Values are shown for reference only. After your plan, extra role reports are ₹299 and a reference refresh is ₹149.
        </p>
      </div>
    </main>
  );
}
