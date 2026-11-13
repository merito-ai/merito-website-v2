"use client";

import { useEffect, useState } from "react";
import type { PlanState as BasePlanState } from "@/lib/plans";
import type { OwnedIndividually } from "./pricing/pricingCatalog";

// interviewCredits: unused paid or plan interviews (lib/interviewCredits); ownedIndividually: non-holders only. Both added by /api/hub/plan-state.
export type PlanState = BasePlanState & { interviewCredits?: number; ownedIndividually?: OwnedIndividually | null };

export type PlanStateResult = { loading: boolean; state: PlanState | null; expired: boolean };

// state === null (error) means "normal user": callers show today's pricing.
// 401 = session expired: stay "loading" so no caller shows prices it can't know; AppShell shows the sign-in prompt.
export async function loadPlanState(): Promise<PlanStateResult> {
  try {
    const res = await fetch("/api/hub/plan-state");
    if (res.status === 401) return { loading: true, state: null, expired: true };
    return { loading: false, state: res.ok ? ((await res.json()) as PlanState) : null, expired: false };
  } catch {
    return { loading: false, state: null, expired: false };
  }
}

export function usePlanState(): PlanStateResult {
  const [result, setResult] = useState<PlanStateResult>({ loading: true, state: null, expired: false });

  useEffect(() => {
    let cancelled = false;
    loadPlanState().then((r) => {
      if (!cancelled) setResult(r);
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

// Mirrors getsPlanInterviewLength (lib/plans.ts): allowlisted users and plan holders get 45-min interviews.
export function hasPlanInterviewLength(state: PlanState | null): boolean {
  return Boolean(state?.allowlisted || state?.plan);
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
