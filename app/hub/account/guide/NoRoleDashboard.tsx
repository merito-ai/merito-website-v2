"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Target, Eye, FileUser, ClipboardList, ShieldCheck, BadgeCheck, Brain } from "lucide-react";
import AuthenticatedFitmentChecker, { CHECK_FIT_LABEL } from "../AuthenticatedFitmentChecker";
import UnlockPlansButton from "./UnlockPlansButton";
import WelcomeLine from "./WelcomeLine";
import { BTN_PRIMARY, BTN_GHOST, FONT_HEAD, FONT_BODY } from "./ui";
import { PLAN_REPORT_COUNT } from "@/lib/planFeatures";

const EM = "not-italic text-[#ed1a24]";
// The seniority-level chip pattern from the dashboard header.
const CHIP = "fv-up inline-flex items-center font-semibold text-[#ed1a24] bg-[#ed1a24]/10 border border-[#ed1a24]/25";

// Phone only: a sticky copy of the screen's one primary action (the hero copy hides below md).
function StickyBar({ children }: { children: ReactNode }) {
  return (
    <div className="fv-sticky md:hidden fixed inset-x-0 bottom-0 bg-[rgb(21,18,22)]/95 border-t border-white/[0.08] [&>button]:w-full" style={{ zIndex: 40, padding: "10px 16px calc(10px + env(safe-area-inset-bottom))" }}>
      {children}
    </div>
  );
}

// Primary "Check my fit for a role": one fitment-checker modal, opened from the hero (md+) or the sticky phone bar.
function CheckFit() {
  return (
    <AuthenticatedFitmentChecker
      renderTrigger={(open) => (
        <>
          <span className="hidden md:inline-flex">
            <button type="button" onClick={open} className={BTN_PRIMARY}>
              <Target size={16} strokeWidth={2} aria-hidden="true" />
              {CHECK_FIT_LABEL}
            </button>
          </span>
          <StickyBar>
            <button type="button" onClick={open} className={BTN_PRIMARY}>
              <Target size={16} strokeWidth={2} aria-hidden="true" />
              {CHECK_FIT_LABEL}
            </button>
          </StickyBar>
        </>
      )}
    />
  );
}

const PREP = (
  <div className="flex flex-wrap" style={{ gap: 8, margin: "16px 0 0" }}>
    {[
      { icon: FileUser, text: "Your CV (PDF or Word)" },
      { icon: ClipboardList, text: "The job description" },
    ].map(({ icon: Icon, text }) => (
      <span key={text} className="inline-flex items-center bg-white/[0.05] border border-white/[0.08] text-white/80" style={{ gap: 6, borderRadius: 999, padding: "6px 12px", fontSize: 12.5 }}>
        <Icon size={14} strokeWidth={2} aria-hidden="true" />
        {text}
      </span>
    ))}
  </div>
);

// Empty dashboard (no role yet): n1 normal, s1 allowlisted without a plan, plan = plan holder (p1). One primary action each.
export default function NoRoleDashboard({
  view,
  name,
  planLabel,
  personality,
  panel,
}: {
  view: "n1" | "s1" | "plan";
  name: string | null;
  planLabel?: string;
  personality?: { label: string; href: string } | null; // plan holders: the personality test works without a role
  panel: ReactNode;
}) {
  const hello = view === "plan" ? `You're all set${name ? `, ${name}` : ""}.` : name ? `Welcome, ${name}.` : "Welcome to Merito HUB.";
  const title =
    view === "n1" ? <>See how well you <em className={EM}>fit your next role.</em></>
    : view === "s1" ? <>Everything you need to <em className={EM}>land your next role.</em></>
    : <em className={EM}>Start by checking a role.</em>;
  const lead =
    view === "n1" ? "Upload your CV and the job you want. You get a fitment score in about 2 minutes, free."
    : view === "s1" ? "One payment unlocks everything your plan includes. Start with a free role check, or pick a plan now."
    : `Upload your CV and the job you want. You have ${PLAN_REPORT_COUNT} roles included.`;

  return (
    <main className={`mx-auto pb-24 md:pb-10 ${FONT_BODY}`} style={{ maxWidth: 1040, padding: "28px 24px 0" }}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start" style={{ gap: 28 }}>
        <div>
          {/* One greeting element: the heading greets, so the one-time welcome line takes the kicker's place. */}
          {view === "s1" && (
            <WelcomeLine storageKey="seminar" spaced>
              Exclusive plans unlocked for you
            </WelcomeLine>
          )}
          {view === "plan" && planLabel && (
            <WelcomeLine
              storageKey="plan"
              spaced
              fallback={
                <span className={CHIP} style={{ gap: 6, borderRadius: 50, padding: "6px 14px", fontSize: 12.5, marginBottom: 14 }}>
                  <BadgeCheck size={14} strokeWidth={2} aria-hidden="true" />
                  {planLabel} · active
                </span>
              }
            >
              Thanks for joining. Your {planLabel} plan is active.
            </WelcomeLine>
          )}
          <h1 className={`fv-up ${FONT_HEAD} font-semibold text-white`} style={{ fontSize: "clamp(1.7rem, 3.6vw, 2.2rem)", lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
            {hello} {title}
          </h1>
          {/* Not animated: it holds the fixed sticky bar and modals (a transform would trap them). */}
          <div>
            <p className="fv-up fv-up-2 text-white/70" style={{ fontSize: 14.5, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 520 }}>
              {lead}
            </p>
            {view !== "s1" && PREP}
            <div className="flex flex-wrap" style={{ gap: 10, marginTop: 18 }}>
              {view === "s1" ? (
                <>
                  <span className="hidden md:inline-flex">
                    <UnlockPlansButton />
                  </span>
                  <StickyBar>
                    <UnlockPlansButton />
                  </StickyBar>
                  <AuthenticatedFitmentChecker
                    renderTrigger={(open) => (
                      <button type="button" onClick={open} className={BTN_GHOST}>
                        <Target size={16} strokeWidth={2} aria-hidden="true" />
                        {CHECK_FIT_LABEL}
                      </button>
                    )}
                  />
                </>
              ) : (
                <>
                  <CheckFit />
                  {view === "n1" && (
                    <Link href="/hub/sample-report" className={BTN_GHOST}>
                      <Eye size={16} strokeWidth={2} aria-hidden="true" />
                      See a sample report
                    </Link>
                  )}
                  {view === "plan" && personality && (
                    <Link href={personality.href} className={BTN_GHOST}>
                      <Brain size={16} strokeWidth={2} aria-hidden="true" />
                      {personality.label}
                    </Link>
                  )}
                </>
              )}
            </div>
            {view === "s1" && (
              <p className="inline-flex items-center text-white/70" style={{ gap: 6, fontSize: 12.5, margin: "14px 0 0" }}>
                <ShieldCheck size={15} strokeWidth={2} className="text-[#3FCB8C]" aria-hidden="true" />
                One-time payment. Features never expire.
              </p>
            )}
            {view === "n1" && (
              <div className="flex items-center bg-[#141416] border border-white/[0.08]" style={{ gap: 12, borderRadius: 14, padding: "10px 14px", marginTop: 20, maxWidth: 420 }}>
                <span aria-hidden="true" className={`flex items-center justify-center shrink-0 ${FONT_HEAD} font-bold text-white`} style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid #3FCB8C", fontSize: 14 }}>
                  7.8
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b className="block text-white" style={{ fontSize: 13 }}>Product Analyst · Good match</b>
                  <small className="block text-white/65" style={{ fontSize: 12 }}>This is what your score looks like</small>
                </span>
                <span className="font-semibold uppercase text-white/70 border border-white/20" style={{ fontSize: 10, letterSpacing: "0.06em", borderRadius: 999, padding: "2px 8px" }}>
                  Sample
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="fv-up fv-up-3">{panel}</div>
      </div>
    </main>
  );
}
