import crypto from "crypto";

function requireEnv(name: "RAZORPAY_KEY_ID" | "RAZORPAY_KEY_SECRET" | "RAZORPAY_WEBHOOK_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Razorpay is not configured (${name} missing).`);
  }
  return value;
}

export type CreateOrderParams = {
  amountPaise: number;
  currency: string;
  receipt: string;
};

export type RazorpayOrder = {
  orderId: string;
};

export async function createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: params.currency,
      receipt: params.receipt,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { id: string };
  return { orderId: data.id };
}

export type CreateRefundResult = {
  refundId: string;
};

export async function createRefund(paymentId: string, amountPaise: number): Promise<CreateRefundResult> {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({ amount: amountPaise }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Razorpay refund failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { id: string };
  return { refundId: data.id };
}

export type RazorpayPayment = {
  id: string;
  order_id: string | null;
  status: string; // "created" | "authorized" | "captured" | "refunded" | "failed"
  amount: number; // paise
  currency: string;
};

export async function fetchPayment(paymentId: string): Promise<RazorpayPayment> {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Razorpay fetchPayment failed (${response.status}): ${body}`);
  }

  return (await response.json()) as RazorpayPayment;
}

export async function fetchOrderPayments(orderId: string): Promise<RazorpayPayment[]> {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}/payments`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Razorpay fetchOrderPayments failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { items?: RazorpayPayment[] };
  return data.items ?? [];
}

export type VerifyPaymentSignatureParams = {
  orderId: string;
  paymentId: string;
  signature: string;
};

export function verifyPaymentSignature(params: VerifyPaymentSignatureParams): boolean {
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(params.signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const webhookSecret = requireEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signatureHeader, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
