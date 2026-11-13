import type { BadgeVariant } from "@/app/admin/_components/Badge";
import type { TransactionStatus } from "@/lib/adminPayments";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";

const ABANDONED_AFTER_MS = 86_400_000;

export const PRODUCT_LABEL: Record<string, string> = {
  report: "Report",
  personality: "Personality",
  references: "References",
  interview: "Interview",
  counselling: "Counselling",
  bundle: "Bundle",
  plan_prepare: PRODUCT_LABELS.plan_prepare,
  plan_mentor: PRODUCT_LABELS.plan_mentor,
  plan_upgrade_mentor: "Upgrade",
};

// A checkout started but never paid for over a day is abandoned, not pending.
export function paymentStatusBadge(status: TransactionStatus, createdAt: string, now: number = Date.now()): { label: string; variant: BadgeVariant } {
  if (status === "initiated") {
    return now - new Date(createdAt).getTime() > ABANDONED_AFTER_MS ? { label: "Abandoned", variant: "neutral" } : { label: "Checkout open", variant: "neutral" };
  }
  if (status === "success") return { label: "Paid", variant: "success" };
  if (status === "refunded") return { label: "Refunded", variant: "warning" };
  return { label: "Failed", variant: "danger" };
}
