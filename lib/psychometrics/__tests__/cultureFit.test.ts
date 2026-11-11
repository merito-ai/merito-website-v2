import { describe, it, expect } from "vitest";
import { cultureFit, CULTURE_BENCHMARKS } from "../cultureFit";

describe("cultureFit", () => {
  it("has the 7 spec benchmarks, each ipsative (sums to 100)", () => {
    expect(CULTURE_BENCHMARKS).toHaveLength(7);
    for (const b of CULTURE_BENCHMARKS) {
      expect(b.profile.Clan + b.profile.Adhocracy + b.profile.Market + b.profile.Hierarchy).toBe(100);
    }
  });
  it("hospital row is the PM-corrected C31/A21/M23/H25", () => {
    expect(CULTURE_BENCHMARKS.find((b) => b.key === "hospital")!.profile).toEqual({ Clan: 31, Adhocracy: 21, Market: 23, Hierarchy: 25 });
  });
  it("same shape as Government/PSU -> capped at 99% and ranked first", () => {
    const r = cultureFit({ Clan: 50, Adhocracy: 36, Market: 40, Hierarchy: 74 }, true);
    expect(r.kind).toBe("fit");
    if (r.kind === "fit") expect(r.fits[0]).toMatchObject({ key: "gov_psu", fit: 99 });
  });
  it("mirror shape -> floored at 1%", () => {
    const r = cultureFit({ Clan: 50, Adhocracy: 64, Market: 60, Hierarchy: 26 }, true);
    expect(r.kind).toBe("fit");
    if (r.kind === "fit") expect(r.fits.find((f) => f.key === "gov_psu")!.fit).toBe(1);
  });
  it("flat profile (population SD < 8) -> no fit", () => {
    expect(cultureFit({ Clan: 60, Adhocracy: 62, Market: 58, Hierarchy: 61 }, true)).toEqual({ kind: "flat" });
  });
  it("uses population SD: sample SD >= 8 but population SD < 8 is still flat", () => {
    // devs ±7.5 -> population SD 7.5, sample SD ≈ 8.66
    expect(cultureFit({ Clan: 57.5, Adhocracy: 42.5, Market: 57.5, Hierarchy: 42.5 }, true)).toEqual({ kind: "flat" });
  });
  it("failed attention checks -> culture mix only", () => {
    expect(cultureFit({ Clan: 90, Adhocracy: 10, Market: 50, Hierarchy: 30 }, false)).toEqual({ kind: "unreliable" });
  });
  it("reliable null is treated as reliable (open issue #6)", () => {
    expect(cultureFit({ Clan: 90, Adhocracy: 10, Market: 50, Hierarchy: 30 }, null).kind).toBe("fit");
  });
  it("fits are sorted high to low and bounded 1-99", () => {
    const r = cultureFit({ Clan: 80, Adhocracy: 70, Market: 30, Hierarchy: 20 }, true);
    expect(r.kind).toBe("fit");
    if (r.kind === "fit") {
      const fs = r.fits.map((f) => f.fit);
      expect(fs).toEqual([...fs].sort((a, b) => b - a));
      for (const f of fs) expect(f >= 1 && f <= 99).toBe(true);
    }
  });
});
