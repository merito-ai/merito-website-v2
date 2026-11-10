"use client";

import { useEffect, useState } from "react";
import type { PlanState } from "@/lib/plans";

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
