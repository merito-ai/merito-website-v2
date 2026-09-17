import { describe, it, expect } from "vitest";
import { TRAITS, BANDS, traitLevel } from "@/lib/personality";
import { SAMPLE_PERSONALITY_SCORES, SAMPLE_PERSONALITY_NAME } from "../personality";

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
