import { TRAITS, type Scores, type TraitKey } from "@/lib/personality";
import type { CultureKey } from "./cultureItems";
import type { FitResult } from "./cultureFit";

export const CULTURE_LABEL: Record<CultureKey, string> = {
  Clan: "Collaborative (Clan)",
  Adhocracy: "Creative (Adhocracy)",
  Market: "Results-driven (Market)",
  Hierarchy: "Structured (Hierarchy)",
};
export const CULTURE_MEANING: Record<CultureKey, string> = {
  Clan: "You value teamwork, mentoring and a supportive, people-first workplace.",
  Adhocracy: "You value experimenting, new ideas and the freedom to take risks.",
  Market: "You value clear targets, competition and measurable results.",
  Hierarchy: "You value clear roles, defined processes and stability.",
};
export const FLAT_TEXT = "No strong preference: adaptable across cultures";
export const UNRELIABLE_TEXT =
  "Some check statements were answered in a way that suggests they weren't read closely, so we show your culture mix only, without organisation-type fit.";
// Spec "Candidate-facing caveats (must appear in report)".
export const CULTURE_CAVEATS = [
  "Typical patterns only. Teams inside one company vary more than industries do.",
  "Fit modestly predicts satisfaction, weakly predicts tenure or performance.",
  "Benchmarks are Merito estimates from small or non-Indian samples.",
  "A preference, not ability, and not a hiring screen.",
  "High Clan scores are common.",
];
export const SELF_DEV_NOTE =
  "This report is for your own development. It describes your self-reported preferences and is not for hiring or promotion decisions.";
// Label for a personality result taken before any role check (plan holders; the test is candidate-wide).
export const NO_ROLE_TITLE = "your next role";
export const SHARE_CULTURE_HEADING = "Work culture: self-reported preferences, for development";

// Neutral, reader-agnostic: compact surfaces are also read by recruiters.
export const FIT_HIDDEN_TEXT = "Fit not shown: some answers suggest low attention";

// One-line culture result for compact surfaces (combined report, share link, samples).
export function cultureFitLine(fit: FitResult): string {
  if (fit.kind === "unreliable") return FIT_HIDDEN_TEXT;
  if (fit.kind === "flat") return FLAT_TEXT;
  return `Closest organisation type: ${fit.fits[0].label} (${fit.fits[0].fit}% fit, Merito estimate)`;
}

export function strengthsAndDevelopment(scores: Scores): { strengths: TraitKey[]; development: TraitKey[] } {
  const ranked = [...TRAITS].sort((a, b) => scores[b].pct - scores[a].pct || TRAITS.indexOf(a) - TRAITS.indexOf(b));
  return { strengths: ranked.slice(0, 2), development: ranked.slice(-2).reverse() };
}
