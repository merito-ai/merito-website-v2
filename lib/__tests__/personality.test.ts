import { describe, it, expect } from "vitest";
import {
  ITEMS,
  IMPRESSION_ITEMS,
  CONSISTENCY_PAIRS,
  ALL_ITEM_IDS,
  scoreTrait,
  scoreAllTraits,
  computeValidity,
  validityFlags,
  isCompleteAnswerSet,
  traitLevel,
  toStoredScores,
  toStoredValidity,
  type Answers,
} from "../personality";

function baselineAnswers(value: number): Answers {
  const answers: Answers = {};
  ALL_ITEM_IDS.forEach((id) => {
    answers[id] = value;
  });
  return answers;
}

describe("scoreTrait", () => {
  it("scores a fully neutral (all 3s) response as Average (band 2, 50%)", () => {
    const answers = baselineAnswers(3);
    const score = scoreTrait(answers, "E");
    expect(score.pct).toBe(50);
    expect(score.band).toBe(2);
  });

  it("scores max-positive answers as Very High (band 4, 100%)", () => {
    const answers = baselineAnswers(3);
    ITEMS.filter((i) => i.t === "E").forEach((it) => {
      answers[it.id] = it.k === "+" ? 5 : 1;
    });
    const score = scoreTrait(answers, "E");
    expect(score.pct).toBe(100);
    expect(score.band).toBe(4);
  });

  it("scores max-negative answers as Very Low (band 0, 0%)", () => {
    const answers = baselineAnswers(3);
    ITEMS.filter((i) => i.t === "E").forEach((it) => {
      answers[it.id] = it.k === "+" ? 1 : 5;
    });
    const score = scoreTrait(answers, "E");
    expect(score.pct).toBe(0);
    expect(score.band).toBe(0);
  });

  it("reverse-keys negatively worded items", () => {
    const answers = baselineAnswers(3);
    // "I don't talk a lot." (id 7, key "-") answered 5 (strongly true) should
    // pull Extroversion DOWN, not up.
    answers[7] = 5;
    const score = scoreTrait(answers, "E");
    expect(score.pct).toBeLessThan(50);
  });
});

describe("scoreAllTraits", () => {
  it("returns a score for all five traits", () => {
    const scores = scoreAllTraits(baselineAnswers(3));
    expect(Object.keys(scores).sort()).toEqual(["A", "C", "E", "ES", "O"]);
  });
});

describe("computeValidity + validityFlags", () => {
  it("flags central-tendency (fence-sitting) when every answer is the midpoint", () => {
    const v = computeValidity(baselineAnswers(3));
    expect(v.pctMid).toBe(100);
    expect(v.incon).toBe(0);
    expect(validityFlags(v)).toContain("central-tendency (fence-sitting)");
  });

  it("flags agreement bias when raw scores skew high", () => {
    const v = computeValidity(baselineAnswers(5));
    expect(validityFlags(v)).toContain("agreement (yea-saying) bias");
  });

  it("flags disagreement bias when raw scores skew low", () => {
    const v = computeValidity(baselineAnswers(1));
    expect(validityFlags(v)).toContain("disagreement bias");
  });

  it("flags social desirability when impression-management items skew high", () => {
    const answers = baselineAnswers(3);
    IMPRESSION_ITEMS.forEach((it) => {
      answers[it.id] = 5;
    });
    const v = computeValidity(answers);
    expect(validityFlags(v)).toContain("socially desirable responding (faking good)");
  });

  it("raises no flags for a varied, decisive, consistent response set", () => {
    const answers = baselineAnswers(3);
    ITEMS.forEach((it) => {
      answers[it.id] = it.id % 2 === 0 ? 4 : 2;
    });
    // Consistency-pair partners must agree with each other regardless of
    // id parity, or the "incon" check trips on this synthetic fixture.
    CONSISTENCY_PAIRS.forEach(([a, b]) => {
      answers[b] = answers[a];
    });
    IMPRESSION_ITEMS.forEach((it) => {
      answers[it.id] = 3;
    });
    const v = computeValidity(answers);
    expect(v.incon).toBe(0);
    expect(validityFlags(v)).toEqual([]);
  });
});

describe("isCompleteAnswerSet", () => {
  it("is true once every item (60 trait + 5 impression-management) is answered 1-5", () => {
    expect(isCompleteAnswerSet(baselineAnswers(3))).toBe(true);
  });

  it("is false when any item is missing", () => {
    const answers = baselineAnswers(3);
    delete answers[ALL_ITEM_IDS[0]];
    expect(isCompleteAnswerSet(answers)).toBe(false);
  });

  it("is false when a rating is out of range", () => {
    const answers = baselineAnswers(3);
    answers[ALL_ITEM_IDS[0]] = 6;
    expect(isCompleteAnswerSet(answers)).toBe(false);
  });
});

describe("traitLevel", () => {
  it("buckets percentile into high/avg/low", () => {
    expect(traitLevel(75)).toBe("high");
    expect(traitLevel(50)).toBe("avg");
    expect(traitLevel(20)).toBe("low");
  });
});

describe("v2 storage helpers (personality_tests keeps the v1 shape)", () => {
  it("toStoredScores rounds pct, derives band, sums keyed raw of answered items", () => {
    const answers = baselineAnswers(3);
    const s = toStoredScores({ E: 64.58, A: 50, C: 100, ES: 0, O: 39.99 }, answers);
    expect(s.E).toEqual({ raw: 36, pct: 65, band: 3 });
    expect(s.C).toEqual({ raw: 36, pct: 100, band: 4 });
    expect(s.ES).toEqual({ raw: 36, pct: 0, band: 0 });
    expect(s.O.pct).toBe(40);
    expect(s.O.band).toBe(2);
  });

  it("toStoredScores raw applies reverse keying", () => {
    const answers = baselineAnswers(5);
    // E: 6 '+' items -> 5 each, 6 '-' items -> 1 each
    expect(toStoredScores({ E: 50, A: 50, C: 50, ES: 50, O: 50 }, answers).E.raw).toBe(36);
    const allPlus = baselineAnswers(5);
    ITEMS.filter((i) => i.t === "E" && i.k === "-").forEach((i) => (allPlus[i.id] = 1));
    expect(toStoredScores({ E: 100, A: 50, C: 50, ES: 50, O: 50 }, allPlus).E.raw).toBe(60);
  });

  it("toStoredValidity maps v2 keys to legacy keys and keeps flags", () => {
    expect(
      toStoredValidity({
        mean_raw: 3.07, pct_mid: 20, inconsistency: 1.67, social_desirability: 2.4,
        longstring: 2, flags: ["x"], answered: 65, total: 65, insufficient: [],
      })
    ).toEqual({ meanRaw: 3.07, pctMid: 20, incon: 1.67, sd: 2.4, longstring: 2, flags: ["x"] });
  });

  it("validityFlags returns stored v2 flags as-is", () => {
    expect(validityFlags({ meanRaw: 4, pctMid: 50, incon: 2, sd: 5, flags: ["x"] })).toEqual(["x"]);
  });

  it("validityFlags on a v1 object (no flags) still computes the old flags", () => {
    expect(validityFlags({ meanRaw: 4, pctMid: 0, incon: 0, sd: 4.2 })).toEqual([
      "agreement (yea-saying) bias",
      "socially desirable responding (faking good)",
    ]);
  });
});
