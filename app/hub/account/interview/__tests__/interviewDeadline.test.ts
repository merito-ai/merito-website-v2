import { describe, it, expect } from "vitest";
import { interviewDeadline, isPastDeadline } from "@/lib/planFeatures";

describe("interviewDeadline", () => {
  it("prefers the vendor magic-link expiry", () => {
    expect(interviewDeadline("2026-11-15T00:00:00Z", "2026-11-01T00:00:00Z")?.toISOString()).toBe("2026-11-15T00:00:00.000Z");
  });
  it("falls back to invited_at + 10 days", () => {
    expect(interviewDeadline(null, "2026-11-01T00:00:00Z")?.toISOString()).toBe("2026-11-11T00:00:00.000Z");
  });
  it("is null with neither", () => {
    expect(interviewDeadline(null, null)).toBeNull();
  });
});

describe("isPastDeadline (E6)", () => {
  it("only a known deadline in the past", () => {
    const now = Date.parse("2026-11-12T00:00:00Z");
    expect(isPastDeadline(new Date("2026-11-11T00:00:00Z"), now)).toBe(true);
    expect(isPastDeadline(new Date("2026-11-13T00:00:00Z"), now)).toBe(false);
    expect(isPastDeadline(null, now)).toBe(false);
  });
});
