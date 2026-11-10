import { describe, it, expect } from "vitest";
import { pyRound } from "../pyRound";

describe("pyRound matches Python round()", () => {
  it.each([
    [3.125, 2, 3.12], // exact binary tie -> half-even (JS toFixed would give 3.13)
    [2.675, 2, 2.67], // not a real tie (2.67499... in binary)
    [64.58333333333333, 2, 64.58],
    [12.5, 0, 12],
    [13.5, 0, 14],
    [0.5, 0, 0],
    [1.5, 0, 2],
    [33.333333333333336, 0, 33],
  ])("pyRound(%s, %s) = %s", (x, n, want) => {
    expect(pyRound(x, n)).toBe(want);
  });
});
