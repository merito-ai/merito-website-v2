import { describe, it, expect } from "vitest";
import { TRAITS, BANDS, traitLevel } from "@/lib/personality";
import { SAMPLE_PERSONALITY_SCORES, SAMPLE_PERSONALITY_NAME, SAMPLE_PERSONALITY_CULTURE } from "../personality";
import { CULTURES } from "@/lib/psychometrics/cultureItems";
import { cultureFit } from "@/lib/psychometrics/cultureFit";

describe("SAMPLE_PERSONALITY_SCORES", () => {
  it("scores all five Big Five traits", () => {
    TRAITS.forEach((trait) => {
      expect(SAMPLE_PERSONALITY_SCORES[trait]).toBeDefined();
    });
  });

  it("keeps pct in range and band consistent with pct, the way scoreTrait produces them", () => {
    TRAITS.forEach((trait) => {
      const { pct, band, raw } = SAMPLE_PERSONALITY_SCORES[trait];
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
      expect(band).toBe(Math.min(4, Math.floor(pct / 20)));
      expect(BANDS[band]).toBeDefined();
      // raw is a 12-item trait sum on a 1-5 scale
      expect(raw).toBeGreaterThanOrEqual(12);
      expect(raw).toBeLessThanOrEqual(60);
      // Without this, a raw bumped without recomputing pct still passes every
      // other assertion here, which is the exact drift these tests exist for.
      expect(pct).toBe(Math.round(((raw - 12) / 48) * 100));
    });
  });

  it("produces a usable work-implication level for every trait", () => {
    TRAITS.forEach((trait) => {
      expect(["high", "avg", "low"]).toContain(traitLevel(SAMPLE_PERSONALITY_SCORES[trait].pct));
    });
  });

  it("uses the fictional sample persona", () => {
    expect(SAMPLE_PERSONALITY_NAME).toBe("Ananya");
  });
});

describe("SAMPLE_PERSONALITY_CULTURE", () => {
  it("has a 0-100 integer score for every culture", () => {
    for (const k of CULTURES) {
      expect(Number.isInteger(SAMPLE_PERSONALITY_CULTURE[k])).toBe(true);
      expect(SAMPLE_PERSONALITY_CULTURE[k]).toBeGreaterThanOrEqual(0);
      expect(SAMPLE_PERSONALITY_CULTURE[k]).toBeLessThanOrEqual(100);
    }
  });
  it("is shaped enough to show a fit %, not the adaptable state", () => {
    const fit = cultureFit(SAMPLE_PERSONALITY_CULTURE, true);
    expect(fit.kind).toBe("fit");
  });
});
