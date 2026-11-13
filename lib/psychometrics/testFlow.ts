import { isCompleteAnswerSet, type Answers } from "@/lib/personality";

export type TestPhase = "intro" | "quiz" | "culture-intro" | "culture-quiz" | "report";

// Where the two-part personality + culture test opens: v1 rows (old personality-only results) show
// their report as-is; a v2 row without culture scores resumes at Part 2.
export function initialPhase(row: { version: number; culture_scores: unknown } | null): TestPhase {
  if (!row) return "intro";
  if (row.version === 2 && row.culture_scores == null) return "culture-intro";
  return "report";
}

// Every personality_tests reader (dashboard, exports, share, admin, recruiter preview) must use this:
// a v2 row with only Part 1 saved is not a completed test. Callers select `version, culture_scores`.
export function isPersonalityComplete(row: { version?: number | null; culture_scores?: unknown } | null | undefined): boolean {
  if (!row) return false;
  return row.version !== 2 || row.culture_scores != null;
}

// v2 replaces v1 for everyone: an old v1 result stays viewable (it is "complete" above) but the
// dashboard and plan panel prompt the updated test, which the personality unlock already covers.
export function needsUpdatedTest(row: { version?: number | null } | null | undefined): boolean {
  return row?.version === 1;
}

// A v1 retake sends Part 1 with Part 2 (so v1 stays until both are done). Keep finished Part 1 answers
// in this browser so a refresh during Part 2 doesn't lose them. Storage can throw (private mode): ignore.
const RETAKE_DRAFT_KEY = "merito-personality-retake-part1";
export function readRetakeDraft(): Answers | null {
  try {
    const a = JSON.parse(globalThis.localStorage?.getItem(RETAKE_DRAFT_KEY) ?? "null");
    return a && typeof a === "object" && isCompleteAnswerSet(a) ? a : null;
  } catch {
    return null;
  }
}

export function writeRetakeDraft(answers: Answers | null): void {
  try {
    if (answers) globalThis.localStorage?.setItem(RETAKE_DRAFT_KEY, JSON.stringify(answers));
    else globalThis.localStorage?.removeItem(RETAKE_DRAFT_KEY);
  } catch {}
}
