"use client";

import { useEffect, useState } from "react";
import type { PlanState as BasePlanState } from "@/lib/plans";

// interviewCredits: unused paid or plan interviews (lib/interviewCredits), added by /api/hub/plan-state.
export type PlanState = BasePlanState & { interviewCredits?: number };

// state === null (error / signed out) means "normal user": callers show today's pricing.
export function usePlanState(): { loading: boolean; state: PlanState | null } {
  const [result, setResult] = useState<{ loading: boolean; state: PlanState | null }>({ loading: true, state: null });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hub/plan-state")
      .then((res) => (res.ok ? (res.json() as Promise<PlanState>) : null))
      .catch(() => null)
      .then((state) => {
        if (!cancelled) setResult({ loading: false, state });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}

export function isPlanOnly(state: PlanState | null): boolean {
  return Boolean(state?.allowlisted && !state.plan);
}

export function freePlanReports(state: PlanState | null, product: string): number {
  return product === "report" && state?.plan ? state.plan.reportCreditsLeft : 0;
}

export function hasUnusedPlanInterview(state: PlanState | null): boolean {
  return Boolean(state?.plan && !state.plan.interviewUsed);
}

// Any unused interview credit (a paid interview or a plan's). Never take payment while one exists.
export function hasUnusedInterviewCredit(state: PlanState | null): boolean {
  return hasUnusedPlanInterview(state) || (state?.interviewCredits ?? 0) > 0;
}

// Locked-card price slot for plan users; null = show the normal price (normal user, or plan extras like a 4th report).
export function planCardLabel(state: PlanState | null, product: "report" | "interview" | "personality" | "references"): string | null {
  // A paid interview credit wins over plan-only gating: it is already paid for.
  if (product === "interview" && !hasUnusedPlanInterview(state) && (state?.interviewCredits ?? 0) > 0) return "Paid, ready to start";
  if (isPlanOnly(state)) return "Available with a plan";
  if (state?.plan && (product === "personality" || product === "references")) return "Included in your plan";
  const reports = freePlanReports(state, product);
  if (reports > 0) return `Included in your plan · ${reports} left`;
  if (product === "interview" && hasUnusedPlanInterview(state)) return "Included in your plan";
  return null;
}
