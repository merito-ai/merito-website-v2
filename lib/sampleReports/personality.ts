import type { Scores } from "@/lib/personality";
import type { CultureScores } from "@/lib/psychometrics/scoring";

// Fictional sample persona. The real report addresses the candidate by first
// name, so the sample needs one too.
export const SAMPLE_PERSONALITY_NAME = "Ananya";

// pct/band/raw satisfy the same relationships scoreTrait() produces:
// pct = round(((raw - 12) / 48) * 100), band = floor(pct / 20) capped at 4.
export const SAMPLE_PERSONALITY_SCORES: Scores = {
  E: { raw: 42, pct: 63, band: 3 },
  A: { raw: 48, pct: 75, band: 3 },
  C: { raw: 51, pct: 81, band: 4 },
  ES: { raw: 45, pct: 69, band: 3 },
  O: { raw: 54, pct: 88, band: 4 },
};

// Sample culture mix (0-100 per culture). Clear shape, so the sample shows a fit % rather than "adaptable".
export const SAMPLE_PERSONALITY_CULTURE: CultureScores = { Clan: 74, Adhocracy: 81, Market: 58, Hierarchy: 37 };
