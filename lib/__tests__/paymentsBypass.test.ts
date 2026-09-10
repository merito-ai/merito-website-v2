import { afterEach, describe, expect, it, vi } from "vitest";
import { arePaymentsBypassed } from "../paymentsBypass";

describe("arePaymentsBypassed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("bypasses only when RAZORPAY_BYPASS is exactly \"true\"", () => {
    vi.stubEnv("RAZORPAY_BYPASS", "true");
    expect(arePaymentsBypassed()).toBe(true);
  });

  it("enforces payments when RAZORPAY_BYPASS is unset (fail closed)", () => {
    vi.stubEnv("RAZORPAY_BYPASS", undefined as unknown as string);
    expect(arePaymentsBypassed()).toBe(false);
  });

  it("enforces payments when RAZORPAY_BYPASS is \"false\"", () => {
    vi.stubEnv("RAZORPAY_BYPASS", "false");
    expect(arePaymentsBypassed()).toBe(false);
  });

  it("enforces payments on any other value (empty, typo, \"1\", \"TRUE\")", () => {
    for (const v of ["", " ", "1", "TRUE", "yes", "on"]) {
      vi.stubEnv("RAZORPAY_BYPASS", v);
      expect(arePaymentsBypassed()).toBe(false);
    }
  });
});
