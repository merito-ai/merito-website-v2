import { TRAITS, type Scores, type TraitKey } from "@/lib/personality";
import type { CultureKey } from "./cultureItems";

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
export const FLAT_TEXT = "No strong preference — adaptable across cultures";
export const UNRELIABLE_TEXT =
  "Some check statements were answered in a way that suggests they weren't read closely, so we show your culture mix only, without organisation-type fit.";
// Spec "Candidate-facing caveats (must appear in report)".
export const CULTURE_CAVEATS = [
  "These are typical patterns only — teams inside one company often differ more than industries do.",
  "Culture fit modestly predicts job satisfaction and only weakly predicts staying or performing well.",
  "The organisation benchmarks are Merito estimates built from small or non-Indian samples.",
  "This shows what you prefer, not what you are able to do, and it is not a hiring screen.",
  "Most people prefer collaborative (Clan) cultures, so a high Clan score is common.",
];
export const SELF_DEV_NOTE =
  "This report is for your own development. It describes your self-reported preferences and is not for hiring or promotion decisions.";
export const SHARE_CULTURE_HEADING = "Work culture — self-reported preferences, for development";

export function strengthsAndDevelopment(scores: Scores): { strengths: TraitKey[]; development: TraitKey[] } {
  const ranked = [...TRAITS].sort((a, b) => scores[b].pct - scores[a].pct || TRAITS.indexOf(a) - TRAITS.indexOf(b));
  return { strengths: ranked.slice(0, 2), development: ranked.slice(-2).reverse() };
}
