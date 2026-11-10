import { ITEMS, IMPRESSION_ITEMS, CONSISTENCY_PAIRS, TRAITS, type TraitKey } from "@/lib/personality";
import { CULTURE_ITEMS, CULTURES, type CultureKey } from "./cultureItems";
import { pyRound } from "./pyRound";

export type { CultureKey } from "./cultureItems";

// Port of staff-assessment-platform/backend/apps/psychometrics/scoring.py (see the rationale comments there).
// Arithmetic keeps Python's operation order so floats match bit-for-bit; scoring.test.ts checks golden.json.
export const ATTN_LOW_FLAG = 6;
export const ATTN_HIGH_FLAG = 2;
export const SD_FLAG = 4.8;
export const IM_FLAG = "very favourable self-description — interpret with care";
export const LONGSTRING_FLAG = 10;
export const MIN_ITEMS_PER_TRAIT = 6;
export const MIN_ITEMS_PER_CULTURE = 5;

export type RawAnswers = Record<string, number>;
export type CultureScores = Record<CultureKey, number>;
export type PersonalityValidityV2 = {
  mean_raw: number;
  pct_mid: number;
  inconsistency: number;
  social_desirability: number;
  longstring: number;
  flags: string[];
  answered: number;
  total: number;
  insufficient: TraitKey[];
};
export type PersonalityResultV2 = { trait_scores: Record<TraitKey, number> | null; validity: PersonalityValidityV2 };
export type CultureResult = { culture_scores: CultureScores | null; reliable: boolean | null; insufficient: CultureKey[] };

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const val = (a: RawAnswers, id: number | string) => a[String(id)];

export function longstring(values: number[]): number {
  let best = 0;
  let run = 0;
  let prev: number | undefined;
  for (const v of values) {
    run = v === prev ? run + 1 : 1;
    prev = v;
    best = Math.max(best, run);
  }
  return best;
}

export function scorePersonality(answers: RawAnswers): PersonalityResultV2 {
  // ITEMS is in seed order (= statement.order), which Python's longstring uses.
  const answered = ITEMS.filter((i) => val(answers, i.id) != null);
  const traitScores = {} as Record<TraitKey, number>;
  const insufficient: TraitKey[] = [];
  for (const t of TRAITS) {
    const keyed = answered.filter((i) => i.t === t).map((i) => (i.k === "-" ? 6 - val(answers, i.id) : val(answers, i.id)));
    if (keyed.length < MIN_ITEMS_PER_TRAIT) {
      insufficient.push(t);
      continue;
    }
    const pct = pyRound(((sum(keyed) / keyed.length - 1) / 4) * 100, 2);
    traitScores[t] = Math.max(0, Math.min(100, pct));
  }
  const values = answered.map((i) => val(answers, i.id));
  const meanRaw = values.length ? sum(values) / values.length : 0;
  const pctMid = values.length ? (100 * values.filter((v) => v === 3).length) / values.length : 0;
  const gaps = CONSISTENCY_PAIRS.filter(([a, b]) => val(answers, a) != null && val(answers, b) != null).map(([a, b]) =>
    Math.abs(val(answers, a) - val(answers, b))
  );
  const inconsistency = gaps.length ? sum(gaps) / gaps.length : 0;
  const im = IMPRESSION_ITEMS.map((i) => val(answers, i.id)).filter((v) => v != null);
  const socialDesirability = im.length ? sum(im) / im.length : 0;
  const run = longstring(values);

  const flags: string[] = [];
  if (meanRaw >= 3.6) flags.push("agreement (yea-saying) bias");
  else if (meanRaw <= 2.4) flags.push("disagreement bias");
  if (pctMid >= 40) flags.push("central-tendency (fence-sitting)");
  if (inconsistency >= 1.5) flags.push("inconsistent / careless responding");
  if (run >= LONGSTRING_FLAG) flags.push(`the same answer given to ${run} statements in a row (possible straight-lining)`);
  if (socialDesirability >= SD_FLAG) flags.push(IM_FLAG);

  return {
    trait_scores: insufficient.length ? null : traitScores,
    validity: {
      mean_raw: pyRound(meanRaw, 2),
      pct_mid: pyRound(pctMid, 2),
      inconsistency: pyRound(inconsistency, 2),
      social_desirability: pyRound(socialDesirability, 2),
      longstring: run,
      flags,
      answered: answered.length + im.length,
      total: ITEMS.length + IMPRESSION_ITEMS.length,
      insufficient,
    },
  };
}

export function scoreCulture(answers: RawAnswers): CultureResult {
  let attnFailed = false;
  let attnAnswered = 0;
  for (const it of CULTURE_ITEMS) {
    if (!it.attention) continue;
    const v = val(answers, it.id);
    if (v == null) continue;
    attnAnswered++;
    if (it.attention === "high" && v <= ATTN_HIGH_FLAG) attnFailed = true;
    else if (it.attention === "low" && v >= ATTN_LOW_FLAG) attnFailed = true;
  }
  const attnTotal = CULTURE_ITEMS.filter((i) => i.attention).length;
  // Skipped attention checks are unknown, not passed.
  const reliable = attnFailed ? false : attnAnswered >= attnTotal ? true : null;

  const keyed: Record<CultureKey, number[]> = { Clan: [], Adhocracy: [], Market: [], Hierarchy: [] };
  for (const it of CULTURE_ITEMS) {
    if (it.culture === "ATTN") continue;
    const v = val(answers, it.id);
    if (v == null) continue;
    keyed[it.culture].push(it.reverse ? 8 - v : v);
  }
  const insufficient = CULTURES.filter((c) => keyed[c].length < MIN_ITEMS_PER_CULTURE);
  if (insufficient.length) return { culture_scores: null, reliable, insufficient };
  const scores = {} as CultureScores;
  for (const c of CULTURES) scores[c] = pyRound(((sum(keyed[c]) / keyed[c].length - 1) / 6) * 100);
  return { culture_scores: scores, reliable, insufficient: [] };
}
