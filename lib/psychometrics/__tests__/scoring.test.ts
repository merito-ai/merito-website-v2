import { describe, it, expect } from "vitest";
import golden from "./golden.json";
import { scorePersonality, scoreCulture, longstring } from "../scoring";

// golden.json is produced by scripts/psychometrics/gen_golden.py running the real Python scoring.py.
// Exact equality on purpose: never loosen to toBeCloseTo.
describe("scorePersonality === Python score_personality", () => {
  it.each(golden.personality.map((c) => [c.name, c] as const))("%s", (_n, c) => {
    expect(scorePersonality(c.answers as Record<string, number>)).toEqual(c.expected);
  });
});

describe("scoreCulture === Python score_culture", () => {
  it.each(golden.culture.map((c) => [c.name, c] as const))("%s", (_n, c) => {
    expect(scoreCulture(c.answers as Record<string, number>)).toEqual(c.expected);
  });
});

it("longstring", () => {
  expect(longstring([1, 1, 2, 2, 2, 3])).toBe(3);
  expect(longstring([])).toBe(0);
});
