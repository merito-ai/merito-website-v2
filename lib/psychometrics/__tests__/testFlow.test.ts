import { it, expect, vi, afterEach } from "vitest";
import { ALL_ITEM_IDS } from "@/lib/personality";
import { initialPhase, isPersonalityComplete, needsUpdatedTest, readRetakeDraft, writeRetakeDraft } from "../testFlow";

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

it.each([
  [null, false],
  [{ version: 1, culture_scores: null }, true], // old result: prompt the updated test
  [{ version: 2, culture_scores: null }, false],
  [{ version: 2, culture_scores: { Clan: 1 } }, false],
])("needsUpdatedTest(%j) -> %s", (row, want) => expect(needsUpdatedTest(row as never)).toBe(want));

afterEach(() => vi.unstubAllGlobals());
const memStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};
const full = Object.fromEntries(ALL_ITEM_IDS.map((id) => [id, 3]));

it("retake draft: a finished Part 1 survives a reload, and is cleared after Part 2", () => {
  vi.stubGlobal("localStorage", memStore());
  writeRetakeDraft(full);
  expect(readRetakeDraft()).toEqual(full);
  writeRetakeDraft(null);
  expect(readRetakeDraft()).toBeNull();
});

it("retake draft: ignores incomplete or corrupt drafts", () => {
  const s = memStore();
  vi.stubGlobal("localStorage", s);
  writeRetakeDraft({ [ALL_ITEM_IDS[0]]: 3 });
  expect(readRetakeDraft()).toBeNull();
  s.setItem("merito-personality-retake-part1", "{not json");
  expect(readRetakeDraft()).toBeNull();
});

it("retake draft: storage that throws (private mode) is a no-op", () => {
  vi.stubGlobal("localStorage", { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); }, removeItem: () => {} });
  expect(() => writeRetakeDraft(full)).not.toThrow();
  expect(readRetakeDraft()).toBeNull();
});
