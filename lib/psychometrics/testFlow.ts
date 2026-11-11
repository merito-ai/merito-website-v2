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
