import { describe, it, expect } from "vitest";
import { paymentStatusBadge, PRODUCT_LABEL } from "../paymentStatus";

describe("paymentStatusBadge", () => {
  const now = Date.parse("2026-11-11T12:00:00Z");

  it("labels checkouts unpaid for over a day as abandoned", () => {
    expect(paymentStatusBadge("initiated", "2026-11-10T11:00:00Z", now).label).toBe("Abandoned");
    expect(paymentStatusBadge("initiated", "2026-11-11T11:00:00Z", now).label).toBe("Checkout open");
  });

  it("uses plain words for other statuses", () => {
    expect(paymentStatusBadge("success", "2026-11-11T11:00:00Z", now)).toEqual({ label: "Paid", variant: "success" });
    expect(paymentStatusBadge("refunded", "2026-11-11T11:00:00Z", now).label).toBe("Refunded");
    expect(paymentStatusBadge("failed", "2026-11-11T11:00:00Z", now).label).toBe("Failed");
  });
});

describe("PRODUCT_LABEL", () => {
  it("names plans by their product names, never Plan 1/Plan 2", () => {
    expect(PRODUCT_LABEL.plan_prepare).toBe("Assess + Prepare");
    expect(PRODUCT_LABEL.plan_mentor).toBe("Assess + Mentor + Apply");
    expect(PRODUCT_LABEL.plan_upgrade_mentor).toBe("Upgrade");
    expect(Object.values(PRODUCT_LABEL).join(" ")).not.toMatch(/Plan [12]/);
  });
});
