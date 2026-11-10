import { it, expect } from "vitest";
import { initialPhase } from "../testFlow";

it.each([
  [null, "intro"],
  [{ version: 1, culture_scores: null }, "report"], // v1 result: viewable as old version
  [{ version: 2, culture_scores: null }, "culture-intro"], // part 1 saved, resume at part 2
  [{ version: 2, culture_scores: { Clan: 1 } }, "report"],
])("%j -> %s", (row, want) => expect(initialPhase(row as never)).toBe(want));
