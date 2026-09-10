/**
 * Whether the paywall is bypassed for dev/test.
 *
 * Fail-CLOSED: bypass only when `RAZORPAY_BYPASS` is exactly the string
 * `"true"`. An unset, empty, or mistyped value means payments are ENFORCED.
 *
 * (The earlier `!== "false"` form failed open — a missing env var in
 * production silently made every paid product free.)
 */
export function arePaymentsBypassed(): boolean {
  return process.env.RAZORPAY_BYPASS === "true";
}
