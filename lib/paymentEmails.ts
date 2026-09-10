import { Resend } from "resend";
import { renderTemplate } from "@/lib/emailTemplates";

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

// Candidate-facing payment emails are deliberately not sent from here —
// Razorpay's own checkout already sends the payer a receipt/failure email;
// a second, Merito-branded one for the same event would be redundant.
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
