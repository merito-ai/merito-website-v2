"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { trackPurchase } from "@/lib/analytics";
import { fetchWithTimeout, networkErrorMessage } from "@/lib/hub/fetchWithTimeout";
import { planCta, type PlanCard } from "./pricingCatalog";
import type { PlanProduct } from "@/lib/plans";

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

// embedded: dashboard offer for allowlisted (seminar) users without a plan; section + h2 instead of a page.
export default function PlanCardsClient({ plans, owned = null, embedded = false }: { plans: PlanCard[]; owned?: PlanProduct | null; embedded?: boolean }) {
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

  const cta = (plan: PlanCard) => {
    const c = planCta(plan.product, owned);
    const base =
      "w-full inline-flex items-center justify-center text-center font-[family-name:var(--font-poppins)] font-semibold text-[12px] md:text-[13.5px] px-2 md:px-4";
    const box = { minHeight: 44, borderRadius: 8, paddingTop: 10, paddingBottom: 10 };
    if (c.kind === "active")
      return (
        <span className={`${base} gap-1.5 text-[#3FCB8C] border border-[#3FCB8C]/40`} style={box}>
          <Check size={15} strokeWidth={2.5} aria-hidden="true" />
          Active
          <span className="sr-only">: {plan.title} is your plan</span>
        </span>
      );
    if (c.kind === "contact")
      return (
        <a href={c.href} className={`${base} text-white border border-white/20 hover:border-white/40 transition-colors`} style={box}>
          Talk to us
          <span className="sr-only"> about {plan.title}</span>
        </a>
      );
    return (
      <>
        <button
          onClick={() => runCheckout(plan.product)}
          disabled={paying !== null}
          className={`${base} text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors disabled:opacity-60`}
          style={{ ...box, border: "none", cursor: paying ? "default" : "pointer" }}
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
  };

  // Highlighted column: the holder's plan, else the most complete one.
  const highlight: PlanProduct = owned ?? "plan_mentor";
  const col = (plan: PlanCard, edge: "" | "top" | "bottom" = "") =>
    plan.product === highlight
      ? `bg-[#ed1a24]/[0.06] border-x border-[#ed1a24]/40${edge === "top" ? " border-t" : edge === "bottom" ? " border-b" : ""}`
      : "";

  const Wrap = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Wrap aria-labelledby="plans-heading">
      <div
        className={embedded ? undefined : "mx-auto px-4 md:px-6"}
        style={{ maxWidth: 1040, ...(embedded ? {} : { paddingTop: 28, paddingBottom: 40 }), display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div>
          {!embedded && (
            <p className={EYEBROW} style={{ fontSize: 10.5, letterSpacing: "0.08em", margin: "0 0 6px" }}>
              Account
            </p>
          )}
          <Heading id="plans-heading" className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.7rem", margin: 0 }}>
            {embedded ? "Plans unlocked for you" : "Your Merito plans"}
          </Heading>
          <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 13.5, margin: "6px 0 0" }}>
            {embedded ? "As a Merito seminar attendee you can unlock everything with one payment." : "One payment, no expiry. Each feature can be used once."}
          </p>
        </div>

        {/* One 3-column comparison at every width; fixed layout keeps 375px from scrolling sideways. */}
        <div className="bg-[#141416] border border-white/[0.08]" style={{ borderRadius: 14, overflow: "hidden" }}>
          <table className="w-full font-[family-name:var(--font-poppins)]" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
            <caption className="sr-only">Compare Merito plans</caption>
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th scope="col" className="text-left align-bottom text-white/40 font-semibold text-[11px] md:text-[12px] px-3 md:px-5" style={{ paddingTop: 18, paddingBottom: 18 }}>
                  What you get
                </th>
                {plans.map((plan) => (
                  <th key={plan.product} scope="col" className={`text-center align-bottom px-1.5 md:px-4 ${col(plan, "top")}`} style={{ paddingTop: 14, paddingBottom: 16 }}>
                    {plan.product === highlight && (
                      <span
                        className="inline-block font-semibold uppercase text-white bg-[#ed1a24] text-[9px] md:text-[10px]"
                        style={{ borderRadius: 999, padding: "2px 8px", letterSpacing: "0.06em", marginBottom: 8 }}
                      >
                        {owned ? "Your plan" : "Most complete"}
                      </span>
                    )}
                    <span className="block font-[family-name:var(--font-gabarito)] font-bold text-white text-[12.5px] md:text-[16px] leading-tight">
                      <span className="md:hidden" aria-hidden="true">
                        {SHORT_TITLE[plan.product]}
                      </span>
                      <span className="sr-only md:not-sr-only">{plan.title}</span>
                    </span>
                    <span className="block font-[family-name:var(--font-gabarito)] font-bold text-white text-[17px] md:text-[26px]" style={{ marginTop: 4 }}>
                      {plan.priceLabel}
                    </span>
                    <span className="block font-normal text-white/45 text-[10px] md:text-[11.5px]" style={{ marginTop: 2 }}>
                      one-time payment
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plans[0].lines.map((line, i) => (
                <tr key={line.label} className="border-b border-white/[0.06] even:bg-white/[0.02]">
                  <th scope="row" className="text-left font-normal px-3 md:px-5 text-[12.5px] md:text-[13.5px]" style={{ paddingTop: 12, paddingBottom: 12 }}>
                    <span className="block text-white/85">{line.label}</span>
                    {line.helper && (
                      <span className="block text-white/50 text-[11px] md:text-[12px]" style={{ marginTop: 2 }}>
                        {line.helper}
                      </span>
                    )}
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.product} className={`text-center px-1.5 md:px-4 ${col(plan)}`} style={{ paddingTop: 12, paddingBottom: 12 }}>
                      <Tick included={plan.lines[i].included} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td />
                {plans.map((plan) => (
                  <td key={plan.product} className={`text-center align-top px-1.5 md:px-4 ${col(plan, "bottom")}`} style={{ paddingTop: 16, paddingBottom: 16 }}>
                    {cta(plan)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-[family-name:var(--font-poppins)] text-white/50" style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 640, margin: 0 }}>
          One-time payment · features never expire · application assistance and mentoring are delivered by the Merito team. Extra role reports are ₹299
          and a reference refresh is ₹149. We refer you; we can&apos;t guarantee interviews or offers.
        </p>
      </div>
    </Wrap>
  );
}

const SHORT_TITLE: Record<PlanProduct, string> = { plan_prepare: "Prepare", plan_mentor: "Mentor + Apply" };

// Not colour/icon alone: the sr-only text carries the meaning.
function Tick({ included }: { included: boolean }) {
  return included ? (
    <span className="inline-flex justify-center">
      <Check size={20} strokeWidth={2.5} className="text-[#3FCB8C]" aria-hidden="true" />
      <span className="sr-only">Included</span>
    </span>
  ) : (
    <span className="inline-flex justify-center">
      <X size={20} strokeWidth={2.25} className="text-[#ed1a24]/70" aria-hidden="true" />
      <span className="sr-only">Not included</span>
    </span>
  );
}
