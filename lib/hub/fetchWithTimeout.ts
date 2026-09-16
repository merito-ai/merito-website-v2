// Payment fetches (razorpay initiate/verify, start-ai-interview) had no
// timeout and no offline check -- a hung network left the "Processing…"
// button spinning forever with no way out but reloading. Shared by every
// hub paywall modal.
const DEFAULT_TIMEOUT_MS = 15000;

export class FetchOfflineError extends Error {
  constructor() {
    super("You appear to be offline. Check your connection and try again.");
    this.name = "FetchOfflineError";
  }
}

export class FetchTimeoutError extends Error {
  constructor() {
    super("That took too long. Check your connection and try again.");
    this.name = "FetchTimeoutError";
  }
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new FetchOfflineError();
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (controller.signal.aborted) throw new FetchTimeoutError();
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function networkErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof FetchOfflineError || err instanceof FetchTimeoutError) return err.message;
  return fallback;
}
