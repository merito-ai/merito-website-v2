"use client";

import { useRef, useState } from "react";
import { Briefcase, AlertTriangle, Clock, Calendar, FileChartColumn, Mic } from "lucide-react";
import type { InterviewStatus } from "./interviewProgress";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import { trackPurchase } from "@/lib/analytics";
import { fetchWithTimeout, networkErrorMessage } from "@/lib/hub/fetchWithTimeout";
import { usePlanState, isPlanOnly, hasUnusedPlanInterview, hasUnusedInterviewCredit, hasPlanInterviewLength } from "./usePlanState";
import { INTERVIEW_VALIDITY_DAYS, INTERVIEW_VALIDITY_NOTE, PLAN_INTERVIEW_SKILLS } from "@/lib/planFeatures";
import PlanOnlyNotice from "./PlanOnlyNotice";
import { useModalFocus } from "./guide/useModalFocus";
import { openRoleSwitcher } from "./guide/ui";

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

export default function InterviewPaywallModal({
  leadId,
  roleTitle,
  level,
  userEmail,
  onClose,
  onStarted,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  userEmail: string;
  onClose: () => void;
  onStarted: (status: InterviewStatus) => void;
}) {
  const [paying, setPaying] = useState(false);
  const { loading: planLoading, state: planState } = usePlanState();
  const [error, setError] = useState<string | null>(null);
  const long = hasPlanInterviewLength(planState);
  // Set once the invite is actually sent — while set, the modal shows a
  // confirmation instead of closing immediately, so the candidate doesn't
  // lose track of the fact that the next step is checking their email, not
  // sitting on this page waiting.
  const [invitedStatus, setInvitedStatus] = useState<InterviewStatus | null>(null);

  const startInterview = async (failText = "Payment succeeded, but starting the interview failed. Please contact support.") => {
    try {
      const res = await fetchWithTimeout("/api/hub/start-ai-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      setPaying(false);
      if (!res.ok) {
        setError(data.error || failText);
        return;
      }
      setInvitedStatus(data.status as InterviewStatus);
    } catch (err) {
      setPaying(false);
      setError(networkErrorMessage(err, failText));
    }
  };

  // Once the invite is sent, dismissing the modal (✕ or backdrop click)
  // should still commit the new status to the dashboard — the interview
  // already happened server-side, this is just closing the confirmation.
  const handleDismiss = () => {
    if (invitedStatus) {
      onStarted(invitedStatus);
    } else {
      onClose();
    }
  };

  const panel = useRef<HTMLDivElement>(null);
  const onKeyDown = useModalFocus(panel, handleDismiss);
  // One interview per plan, for one role: confirm the role before the credit is spent.
  const planConfirm = !invitedStatus && hasUnusedPlanInterview(planState);
  const switchRole = () => {
    onClose();
    setTimeout(openRoleSwitcher, 0); // after focus returns to the opener
  };

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const res = await fetchWithTimeout("/api/hub/razorpay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "interview" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPaying(false);
        setError(data.error || "Something went wrong. Please try again.");
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
            if (!verifyRes.ok) {
              setPaying(false);
              setError(verifyData.error || "Payment succeeded, but verification failed. Please contact support.");
              return;
            }
            trackPurchase("interview");
            await startInterview();
          } catch (err) {
            setPaying(false);
            setError(networkErrorMessage(err, "Payment succeeded, but verification failed. Please refresh."));
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      setError(networkErrorMessage(err, "Something went wrong. Please try again."));
    }
  };

  return (
    <div
      onClick={handleDismiss}
      className="flex items-end sm:items-center justify-center sm:p-5"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50 }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="interview-modal-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="fv-pop bg-white rounded-t-[24px] sm:rounded-[24px] outline-none"
        style={{ maxWidth: 480, width: "100%", padding: 28, position: "relative", maxHeight: "92vh", overflowY: "auto" }}
      >
        <button
          onClick={handleDismiss}
          aria-label="Close"
          style={{ position: "absolute", top: 8, right: 8, width: 44, height: 44, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b6b6b" }}
        >
          ✕
        </button>

        {invitedStatus ? (
          <>
            <div
              className="bg-[#eefdf1]"
              style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}
            >
              <span style={{ color: "#16803c", fontSize: 20, fontWeight: 700 }}>✓</span>
            </div>
            <h2 id="interview-modal-title" className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 10px" }}>
              You&apos;re all set
            </h2>
            <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 20px" }}>
              {`Your AI interview for ${roleTitle} is ready. Launch it from your dashboard whenever you're ready, and complete it within ${INTERVIEW_VALIDITY_DAYS} days.`}
            </p>
            <button
              onClick={handleDismiss}
              className="w-full font-[family-name:var(--font-poppins)] font-semibold text-white"
              style={{ height: 50, borderRadius: 8, fontSize: 15, background: "#ed1a24", border: "none", cursor: "pointer", boxShadow: "0 4px 6px rgba(236,34,40,0.3)" }}
            >
              Got it
            </button>
          </>
        ) : planConfirm ? (
          <>
            <h2 id="interview-modal-title" className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 44px 6px 0" }}>
              Start your interview?
            </h2>
            <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 14px" }}>
              This uses your plan&apos;s interview for {roleTitle}.
            </p>
            <div className="flex items-center bg-[#f4f4f5] font-[family-name:var(--font-poppins)]" style={{ gap: 10, borderRadius: 12, padding: "6px 6px 6px 12px", marginBottom: 10 }}>
              <Briefcase size={16} strokeWidth={2} className="text-[#4b4b4d] shrink-0" aria-hidden="true" />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b className="block text-black truncate" style={{ fontSize: 14 }}>{roleTitle}</b>
                <small className="block text-[#5b5b5d]" style={{ fontSize: 12 }}>Interview role</small>
              </span>
              <button type="button" onClick={switchRole} className="font-semibold text-[#b3121a] hover:underline rounded-md focus-visible:outline-2 focus-visible:outline-black" style={{ fontSize: 13, minHeight: 44, padding: "0 10px", background: "none", border: "none", cursor: "pointer" }}>
                Switch role
              </button>
            </div>
            <p className="flex items-start bg-[#fff4e5] text-[#6b4300] font-[family-name:var(--font-poppins)]" style={{ gap: 8, borderRadius: 12, padding: "10px 12px", fontSize: 13, lineHeight: 1.5, margin: "0 0 14px" }}>
              <AlertTriangle size={16} strokeWidth={2} className="shrink-0" style={{ marginTop: 1 }} aria-hidden="true" />
              <span>You can&apos;t switch it to another role later. Want a different role? Switch roles first.</span>
            </p>
            <ul className="font-[family-name:var(--font-poppins)] text-[#2b2b2d]" style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <li className="flex items-center" style={{ gap: 8 }}><Clock size={15} strokeWidth={2} aria-hidden="true" />45 minutes, about {PLAN_INTERVIEW_SKILLS} skills from this role</li>
              <li className="flex items-center" style={{ gap: 8 }}><Calendar size={15} strokeWidth={2} aria-hidden="true" />You have {INTERVIEW_VALIDITY_DAYS} days to finish, starting now</li>
              <li className="flex items-center" style={{ gap: 8 }}><FileChartColumn size={15} strokeWidth={2} aria-hidden="true" />Scored report when you finish</li>
            </ul>
            <button
              type="button"
              onClick={() => {
                setPaying(true);
                setError(null);
                void startInterview("Couldn't start your interview. Please try again or contact support.");
              }}
              disabled={paying}
              className="w-full inline-flex items-center justify-center font-[family-name:var(--font-poppins)] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              style={{ gap: 8, minHeight: 50, borderRadius: 8, fontSize: 15, background: paying ? "#9c9c9c" : "#d9161f", border: "none", cursor: paying ? "default" : "pointer", padding: "0 16px" }}
            >
              <Mic size={16} strokeWidth={2} aria-hidden="true" />
              {paying ? "Starting…" : `Start interview for ${roleTitle}`}
            </button>
            <button type="button" onClick={onClose} className="w-full font-[family-name:var(--font-poppins)] font-semibold text-[#4b4b4d] hover:text-black" style={{ minHeight: 44, marginTop: 6, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
              Not now
            </button>
          </>
        ) : (
          <>
            <h2 id="interview-modal-title" className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 10px" }}>
              Ready for a real AI interview?
            </h2>
            <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13.5, lineHeight: 1.6, margin: "0 0 8px" }}>
              {`Once started, launch your ${long ? "45-min " : ""}AI interview for ${roleTitle} from your dashboard whenever you're ready.`}
            </p>
            <p className="font-[family-name:var(--font-poppins)] text-black" style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.6, margin: "0 0 20px" }}>
              {INTERVIEW_VALIDITY_NOTE}
            </p>

            {hasUnusedInterviewCredit(planState) ? (
              <>
                {!hasUnusedPlanInterview(planState) && (
                  <p className="font-[family-name:var(--font-poppins)] text-black" style={{ fontSize: 13.5, fontWeight: 600, margin: "0 0 12px" }}>
                    You have 1 interview credit: start now
                  </p>
                )}
              <button
                onClick={() => {
                  setPaying(true);
                  setError(null);
                  void startInterview("Couldn't start your interview. Please try again or contact support.");
                }}
                disabled={paying}
                className="w-full font-[family-name:var(--font-poppins)] font-semibold text-white"
                style={{ height: 50, borderRadius: 8, fontSize: 15, background: paying ? "#dcdcdc" : "#ed1a24", border: "none", cursor: paying ? "default" : "pointer", boxShadow: paying ? "none" : "0 4px 6px rgba(236,34,40,0.3)" }}
              >
                {paying
                  ? "Starting…"
                  : hasUnusedPlanInterview(planState)
                    ? "Start your 45-min interview (included in your plan)"
                    : long ? "Start your 45-min interview (already paid)" : "Start interview (already paid)"}
              </button>
              </>
            ) : isPlanOnly(planState) ? (
              <PlanOnlyNotice />
            ) : (
              <>
                <button
                  onClick={handlePay}
                  disabled={paying || planLoading}
                  className="w-full font-[family-name:var(--font-poppins)] font-semibold text-white"
                  style={{ height: 50, borderRadius: 8, fontSize: 15, background: paying || planLoading ? "#dcdcdc" : "#ed1a24", border: "none", cursor: paying || planLoading ? "default" : "pointer", boxShadow: paying || planLoading ? "none" : "0 4px 6px rgba(236,34,40,0.3)" }}
                >
                  {paying ? "Processing…" : planLoading ? "Checking your plan…" : long ? `Pay ${formatPrice(PRODUCT_PRICING.interview[level])} for a 45-min interview` : `Pay ${formatPrice(PRODUCT_PRICING.interview[level])}`}
                </button>
                <p className="text-[#6b6b6b]" style={{ fontSize: 11.5, textAlign: "center", margin: "10px 0 0" }}>
                  One-time payment per attempt · UPI, card & netbanking
                </p>
              </>
            )}
          </>
        )}

        {error && (
          <p role="alert" style={{ fontSize: 12.5, color: "#c8151e", marginTop: 10, textAlign: "center" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
