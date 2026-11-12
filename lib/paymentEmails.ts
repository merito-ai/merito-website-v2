import { Resend } from "resend";
import { renderTemplate } from "@/lib/emailTemplates";
import { getSupabaseServerClient } from "@/lib/supabase";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";
import { buildPlanPanelRows } from "@/lib/planPanel";
import { INTERVIEW_VALIDITY_NOTE, ASSISTANCE_NEXT_STEP } from "@/lib/planFeatures";
import { buildPlanCards } from "@/app/hub/account/pricing/pricingCatalog";
import { getAbsoluteUrl } from "@/lib/site";
import type { PlanProduct } from "@/lib/plans";

type PaymentFailedAlertParams = {
  orderId: string;
  amountPaise: number;
  candidateEmail: string;
};

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email service is not configured (RESEND_API_KEY missing).");
  }
  return new Resend(apiKey);
}

function getFromEmail(): string {
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("Email service is not configured (CONTACT_FROM_EMAIL missing).");
  }
  return fromEmail;
}

function getOpsEmail(): string {
  const toEmail = process.env.CONTACT_TO_EMAIL;
  if (!toEmail) {
    throw new Error("Email service is not configured (CONTACT_TO_EMAIL missing).");
  }
  return toEmail;
}

// Candidate-facing receipt/failure emails are deliberately not sent from here —
// Razorpay's own checkout already sends the payer one. The plan welcome below is
// onboarding (what you got + where to start), not a receipt.

// Plan bought or upgraded (product = the effective plan). Benefits use the comparison-table
// wording, steps the dashboard panel's. Caller sends once per order and swallows failures.
export async function sendPlanWelcomeEmail(userId: string, product: PlanProduct, upgraded = false): Promise<void> {
  const { data } = await getSupabaseServerClient().auth.admin.getUserById(userId);
  const to = data?.user?.email;
  if (!to) return;
  const name = PRODUCT_LABELS[product];
  const benefits = buildPlanCards().find((c) => c.product === product)!.lines.filter((l) => l.included).map((l) => l.label);
  const steps = buildPlanPanelRows({ product, reportCreditsLeft: 3, personality: "none", interview: "unused", references: "none", mentoring: [] })
    .filter((r) => r.included)
    .map((r) => r.title);
  // An upgrade already did step 1 on Plan 1: point at the new part (mentoring) instead.
  const [cta, url] = upgraded ? ["Book your first mentoring session", getAbsoluteUrl("/hub/account/expert")] : ["Start with step 1: check a role", getAbsoluteUrl("/hub/account")];
  const notes = [`Mock AI interview: ${INTERVIEW_VALIDITY_NOTE}`, ...(product === "plan_mentor" ? [`Application assistance: ${ASSISTANCE_NEXT_STEP}`] : [])];
  const text = [
    `Your Merito plan "${name}" is active.`,
    "",
    "What's included:",
    ...benefits.map((b) => `- ${b}`),
    "",
    "Your steps:",
    ...steps.map((st, i) => `${i + 1}. ${st}`),
    "",
    "Good to know:",
    ...notes.map((n) => `- ${n}`),
    "",
    `${cta}\n${url}`,
  ].join("\n");
  const html =
    `<p>Your Merito plan <strong>${name}</strong> is active.</p>` +
    `<p><strong>What's included:</strong></p><ul>${benefits.map((b) => `<li>${b}</li>`).join("")}</ul>` +
    `<p><strong>Your steps:</strong></p><ol>${steps.map((st) => `<li>${st}</li>`).join("")}</ol>` +
    `<p><strong>Good to know:</strong></p><ul>${notes.map((n) => `<li>${n}</li>`).join("")}</ul>` +
    `<p><a href="${url}">${cta}</a></p>`;

  await getResendClient().emails.send({ from: getFromEmail(), to: [to], subject: `Your Merito plan is active: ${name}`, text, html });
}
export async function sendPaymentFailedAlertEmail(params: PaymentFailedAlertParams): Promise<void> {
  const resend = getResendClient();
  const rupees = (params.amountPaise / 100).toFixed(2);
  const rendered = await renderTemplate("payment_failed_alert", { orderId: params.orderId, amountRupees: rupees, candidateEmail: params.candidateEmail });

  await resend.emails.send({
    from: getFromEmail(),
    to: [getOpsEmail()],
    subject: rendered.subject,
    text: rendered.bodyText,
    html: rendered.bodyHtml,
  });
}

type PaymentGuardMismatchParams = {
  orderId: string;
  paymentId: string;
  amountPaise: number;
};

// Ops-only alert: Razorpay reported a captured payment whose amount/status/order
// did not match our transaction record, so finalize refused to grant the
// product. Not templated (candidates never see it, no admin edits it) — the
// expected amount is in the finalize console.error log alongside this.
export async function sendPaymentGuardMismatchAlert(params: PaymentGuardMismatchParams): Promise<void> {
  const resend = getResendClient();
  const rupees = (params.amountPaise / 100).toFixed(2);
  const text = `A Razorpay payment failed our amount/capture check and was NOT granted.\n\nOrder: ${params.orderId}\nPayment: ${params.paymentId}\nAmount Razorpay reported: ₹${rupees}\n\nThe expected amount is in the server logs ("finalize: payment guard mismatch"). Check the Razorpay dashboard and reconcile manually.`;

  await resend.emails.send({
    from: getFromEmail(),
    to: [getOpsEmail()],
    subject: `⚠ Razorpay amount mismatch — order ${params.orderId}`,
    text,
    html: `<p>A Razorpay payment failed our amount/capture check and was <strong>NOT granted</strong>.</p><p>Order: ${params.orderId}<br/>Payment: ${params.paymentId}<br/>Amount Razorpay reported: ₹${rupees}</p><p>The expected amount is in the server logs ("finalize: payment guard mismatch"). Check the Razorpay dashboard and reconcile manually.</p>`,
  });
}

type RefundFailedParams = {
  orderId: string;
  refundId: string;
  amountPaise: number;
};

// Ops-only alert: Razorpay accepted a refund request (the admin's synchronous
// call got a 200 and we marked the transaction "refunded" + revoked
// entitlement immediately) but later reported it actually failed -- money
// never moved. Deliberately not auto-corrected here, same reasoning as
// sendPaymentGuardMismatchAlert: a webhook flipping financial/entitlement
// state back and forth is riskier than a human reconciling it once.
export async function sendRefundFailedAlert(params: RefundFailedParams): Promise<void> {
  const resend = getResendClient();
  const rupees = (params.amountPaise / 100).toFixed(2);
  const text = `A Razorpay refund we already marked "refunded" actually FAILED on Razorpay's side.\n\nOrder: ${params.orderId}\nRefund: ${params.refundId}\nAmount: ₹${rupees}\n\nOur DB still shows this transaction refunded and the candidate's entitlement already revoked, but the money never moved. Check the Razorpay dashboard and either retry the refund or restore entitlement manually.`;

  await resend.emails.send({
    from: getFromEmail(),
    to: [getOpsEmail()],
    subject: `⚠ Razorpay refund failed after being marked refunded — order ${params.orderId}`,
    text,
    html: `<p>A Razorpay refund we already marked "refunded" actually <strong>FAILED</strong> on Razorpay's side.</p><p>Order: ${params.orderId}<br/>Refund: ${params.refundId}<br/>Amount: ₹${rupees}</p><p>Our DB still shows this transaction refunded and the candidate's entitlement already revoked, but the money never moved. Check the Razorpay dashboard and either retry the refund or restore entitlement manually.</p>`,
  });
}

type StuckPaymentParams = {
  orderId: string;
  amountPaise: number;
  ageHours: number;
};

// Ops-only alert: a razorpay_transactions row has sat "initiated" past 24h — the
// reconcile cron asked Razorpay and still found no captured payment. Either the
// payer abandoned checkout (safe) or money was taken and nothing delivered.
export async function sendStuckPaymentAlert(params: StuckPaymentParams): Promise<void> {
  const resend = getResendClient();
  const rupees = (params.amountPaise / 100).toFixed(2);
  const age = params.ageHours.toFixed(1);
  const text = `A Razorpay transaction has been stuck "initiated" for ${age}h and could not be reconciled against Razorpay.\n\nOrder: ${params.orderId}\nAmount: ₹${rupees}\n\nCheck the Razorpay dashboard: if the payment was captured, finalize/refund it manually; if not, the payer abandoned checkout and this can be ignored.`;

  await resend.emails.send({
    from: getFromEmail(),
    to: [getOpsEmail()],
    subject: `⚠ Razorpay payment stuck 24h+ (order not reconciled) — ${params.orderId}`,
    text,
    html: `<p>A Razorpay transaction has been stuck "initiated" for ${age}h and could not be reconciled against Razorpay.</p><p>Order: ${params.orderId}<br/>Amount: ₹${rupees}</p><p>Check the Razorpay dashboard: if the payment was captured, finalize/refund it manually; if not, the payer abandoned checkout and this can be ignored.</p>`,
  });
}
