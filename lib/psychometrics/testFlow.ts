export type TestPhase = "intro" | "quiz" | "culture-intro" | "culture-quiz" | "report";

// Where the two-part personality + culture test opens: v1 rows (old personality-only results) show
// their report as-is; a v2 row without culture scores resumes at Part 2.
export function initialPhase(row: { version: number; culture_scores: unknown } | null): TestPhase {
  if (!row) return "intro";
  if (row.version === 2 && row.culture_scores == null) return "culture-intro";
  return "report";
}
