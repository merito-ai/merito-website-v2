import { it, expect } from "vitest";
import { initialPhase, isPersonalityComplete } from "../testFlow";

it.each([
  [null, "intro"],
  [{ version: 1, culture_scores: null }, "report"], // v1 result: viewable as old version
  [{ version: 2, culture_scores: null }, "culture-intro"], // part 1 saved, resume at part 2
  [{ version: 2, culture_scores: { Clan: 1 } }, "report"],
])("%j -> %s", (row, want) => expect(initialPhase(row as never)).toBe(want));

it.each([
  [null, false],
  [undefined, false],
  [{ version: 1, culture_scores: null }, true], // v1 rows are complete once they exist
  [{ culture_scores: null }, true], // pre-0070 row shape (no version column) = v1
  [{ version: 2, culture_scores: null }, false], // part 1 only: not a completed test anywhere
  [{ version: 2, culture_scores: { Clan: 1 } }, true],
])("isPersonalityComplete(%j) -> %s", (row, want) => expect(isPersonalityComplete(row as never)).toBe(want));
