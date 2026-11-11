"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
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

  const buyButton = (plan: PlanCard) => (
    <>
      <button
        onClick={() => runCheckout(plan.product)}
        disabled={paying !== null}
        className="w-full text-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60"
        style={{ minHeight: 44, borderRadius: 8, padding: "11px 16px", fontSize: 13.5, border: "none", cursor: paying ? "default" : "pointer" }}
      >
        {paying === plan.product ? "Opening payment…" : "Choose this plan"}
        {paying !== plan.product && <span className="sr-only">: {plan.title}, {plan.priceLabel}</span>}
      </button>
      {error?.product === plan.product && (
        <p role="alert" className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 12.5, color: "#ed1a24", margin: "10px 0 0", textAlign: "center" }}>
          {error.message}
        </p>
      )}
    </>
  );

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

        {/* Desktop: comparison table. Mobile: one stacked card per plan with the same rows (no horizontal scroll). */}
        <div className="hidden md:block bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, overflow: "hidden" }}>
          <table className="w-full font-[family-name:var(--font-poppins)]" style={{ borderCollapse: "collapse", fontSize: 13.5 }}>
            <caption className="sr-only">Compare Merito plans</caption>
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th scope="col" className="text-left text-white/40 font-semibold" style={{ padding: "18px 20px", fontSize: 12 }}>
                  What you get
                </th>
                {plans.map((plan) => (
                  <th key={plan.product} scope="col" className="text-center" style={{ padding: "18px 16px", width: "26%" }}>
                    <span className="block font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 16 }}>
                      {plan.title}
                    </span>
                    <span className="block font-[family-name:var(--font-gabarito)] font-bold text-white" style={{ fontSize: 22, marginTop: 4 }}>
                      {plan.priceLabel}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans[0].lines.map((line, i) => (
                <tr key={line.label} className="border-b border-white/[0.06]">
                  <th scope="row" className="text-left font-normal" style={{ padding: "12px 20px" }}>
                    <span className="block text-white/85">{line.label}</span>
                    {line.helper && <span className="block text-white/50" style={{ fontSize: 12, marginTop: 2 }}>{line.helper}</span>}
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.product} className="text-center" style={{ padding: "12px 16px" }}>
                      <Tick included={plan.lines[i].included} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td />
                {plans.map((plan) => (
                  <td key={plan.product} className="text-center align-top" style={{ padding: "16px" }}>
                    {buyButton(plan)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col" style={{ gap: 14 }}>
          {plans.map((plan) => (
            <section key={plan.product} aria-label={plan.title} className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, padding: 18 }}>
              <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: 16, margin: 0 }}>
                {plan.title}
              </h2>
              <p className="font-[family-name:var(--font-gabarito)] font-bold text-white" style={{ fontSize: 22, margin: "4px 0 12px" }}>
                {plan.priceLabel}
              </p>
              <ul className="font-[family-name:var(--font-poppins)]" style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.lines.map((line) => (
                  <li key={line.label} className="flex items-start" style={{ gap: 10, fontSize: 13 }}>
                    <Tick included={line.included} />
                    <span style={{ flex: 1 }}>
                      <span className={line.included ? "block text-white/85" : "block text-white/50 line-through"}>{line.label}</span>
                      {line.helper && <span className="block text-white/50" style={{ fontSize: 12, marginTop: 2 }}>{line.helper}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              {buyButton(plan)}
            </section>
          ))}
        </div>

        <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
          After your plan, extra role reports are ₹299 and a reference refresh is ₹149. Application assistance: we refer you; we can&apos;t guarantee
          interviews or offers.
        </p>
      </div>
    </main>
  );
}

// Not colour/icon alone: the sr-only text carries the meaning.
function Tick({ included }: { included: boolean }) {
  return included ? (
    <span className="inline-flex shrink-0" style={{ marginTop: 1 }}>
      <Check size={16} strokeWidth={2.5} className="text-[#3FCB8C]" aria-hidden="true" />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="inline-flex shrink-0" style={{ marginTop: 1 }}>
      <X size={16} strokeWidth={2} className="text-white/40" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  );
}
