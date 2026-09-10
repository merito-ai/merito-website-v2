import { getSupabaseServerClient } from "@/lib/supabase";
import { fetchOrderPayments } from "@/lib/razorpay/client";
import { finalizeRazorpayOrder } from "@/lib/razorpay/finalize";
import { sendStuckPaymentAlert } from "@/lib/paymentEmails";

export type ReconcileSummary = {
  scanned: number;
  recovered: number;
  stale: number;
  waiting: number;
  errored: number;
};

const STUCK_AFTER_MS = 15 * 60_000;

// Runs every 15 min. A razorpay_transactions row that is still "initiated" long
// after checkout means both the client callback and the webhook were lost —
// money possibly taken, nothing delivered, and nothing else will ever notice.
// This sweep asks Razorpay directly: if the order has a captured payment we
// finalize it (with the same amount/capture guards the webhook uses); if not,
// we wait, and once past 24h we alert ops once.
//
// Re-alert guard: we email only while 24 <= ageHours < 25. At a 15-min cadence
// that is at most ~4 emails for a single stuck row, in one window, with no new
// DB column to track "already alerted".
export async function reconcileStuckTransactions(
  opts: { now?: Date } = {}
): Promise<ReconcileSummary> {
  const now = opts.now ?? new Date();
  const supabase = getSupabaseServerClient();
  const cutoff = new Date(now.getTime() - STUCK_AFTER_MS).toISOString();

  const { data: rows, error } = await supabase
    .from("razorpay_transactions")
    .select("order_id, amount_paise, created_at")
    .eq("status", "initiated")
    .lt("created_at", cutoff)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("reconcile: failed to load stuck transactions", { error });
    return { scanned: 0, recovered: 0, stale: 0, waiting: 0, errored: 0 };
  }

  const summary: ReconcileSummary = { scanned: 0, recovered: 0, stale: 0, waiting: 0, errored: 0 };

  for (const row of rows ?? []) {
    summary.scanned++;
    try {
      const payments = await fetchOrderPayments(row.order_id);
      const captured = payments.find((p) => p.status === "captured");

      if (captured) {
        const result = await finalizeRazorpayOrder(row.order_id, captured.id, {
          amountPaise: captured.amount,
          status: "captured",
          orderId: row.order_id,
        });
        if (result.ok) {
          summary.recovered++;
        } else {
          console.error("reconcile: finalize rejected a captured payment", { orderId: row.order_id, result });
          summary.errored++;
        }
        continue;
      }

      const ageHours = (now.getTime() - Date.parse(row.created_at)) / 3_600_000;
      if (ageHours >= 24 && ageHours < 25) {
        await sendStuckPaymentAlert({ orderId: row.order_id, amountPaise: row.amount_paise, ageHours });
        summary.stale++;
      } else if (ageHours >= 25) {
        summary.stale++; // already alerted in the 24-25h window
      } else {
        summary.waiting++;
      }
    } catch (err) {
      console.error("reconcile: order failed", { orderId: row.order_id, err });
      summary.errored++;
    }
  }

  return summary;
}
