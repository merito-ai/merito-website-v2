"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackPurchase } from "@/lib/analytics";
import { fetchWithTimeout, networkErrorMessage } from "@/lib/hub/fetchWithTimeout";
import { planConfirmContent, type PlanCard } from "./pricingCatalog";
import PlanConfirmDialog from "./PlanConfirmDialog";
import { usePlanState } from "../usePlanState";
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

export type PlanBuy = PlanProduct | "plan_upgrade_mentor";

// The one plan checkout (pricing table + plans popup): confirm dialog first, then Razorpay. Moved from PlanCardsClient.
export function usePlanCheckout(plans: PlanCard[]) {
  const router = useRouter();
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<{ product: string; message: string } | null>(null);
  // Confirm before Razorpay opens; planState feeds the "you already have" note.
  const [confirming, setConfirming] = useState<PlanBuy | null>(null);
  const { state: planState } = usePlanState();

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

  const dialog = confirming && (
    <PlanConfirmDialog
      content={planConfirmContent(plans, confirming, planState?.ownedIndividually ?? null)}
      onCancel={() => setConfirming(null)}
      onConfirm={() => {
        setConfirming(null);
        runCheckout(confirming);
      }}
    />
  );

  return { paying, error, choose: setConfirming, dialog };
}
