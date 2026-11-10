import { CULTURES, type CultureKey } from "./cultureItems";
import type { CultureScores } from "./scoring";

export type Benchmark = { key: string; label: string; profile: Record<CultureKey, number>; basis: string };

// Merito estimate v1, set 2026-11-10 (spec "Culture benchmarks"). Ipsative C/A/M/H, each row sums to 100.
export const CULTURE_BENCHMARKS: Benchmark[] = [
  { key: "gov_psu", label: "Government / PSU", profile: { Clan: 25, Adhocracy: 18, Market: 20, Hierarchy: 37 }, basis: "Public-sector studies (Croatia, Pakistan): hierarchy dominant — direction only" },
  { key: "hospital", label: "Hospital / healthcare", profile: { Clan: 31, Adhocracy: 21, Market: 23, Hierarchy: 25 }, basis: "Croatian hospitals study — published numbers" },
  { key: "startup", label: "Early-stage startup", profile: { Clan: 33, Adhocracy: 32, Market: 20, Hierarchy: 15 }, basis: "Startup/scale-up studies: clan + adhocracy — weak" },
  { key: "product_tech", label: "Product / tech company (scale-up)", profile: { Clan: 26, Adhocracy: 28, Market: 28, Hierarchy: 18 }, basis: "Scale-up preference data — weak" },
  { key: "family_sme", label: "Family business / SME", profile: { Clan: 36, Adhocracy: 22, Market: 18, Hierarchy: 24 }, basis: "Family-business review: clan + adhocracy — weak–moderate" },
  { key: "sales_finance", label: "Sales / finance / consulting", profile: { Clan: 20, Adhocracy: 20, Market: 37, Hierarchy: 23 }, basis: "Qualitative CVF descriptions — weak" },
  { key: "it_mnc_mfg", label: "IT services / MNC / manufacturing", profile: { Clan: 22, Adhocracy: 20, Market: 28, Hierarchy: 30 }, basis: "Indian IT+manufacturing sample ≈ flat; shape is estimate — weak" },
];

// shortcut: untested threshold (spec) — recalibrate on real Merito data. Population SD (PM decision #4).
export const FLAT_SD = 8;

export type Fit = { key: string; label: string; basis: string; fit: number };
export type FitResult = { kind: "unreliable" } | { kind: "flat" } | { kind: "fit"; fits: Fit[] };

const centred = (xs: number[]) => {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return xs.map((x) => x - m);
};
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

// Profile-correlation fit: compare shape, not level (candidate scores are independent 0-100, benchmarks ipsative).
export function cultureFit(scores: CultureScores, reliable: boolean | null): FitResult {
  if (reliable === false) return { kind: "unreliable" };
  const x = centred(CULTURES.map((c) => scores[c]));
  if (Math.sqrt(dot(x, x) / x.length) < FLAT_SD) return { kind: "flat" };
  const fits = CULTURE_BENCHMARKS.map((b) => {
    const y = centred(CULTURES.map((c) => b.profile[c]));
    const r = dot(x, y) / Math.sqrt(dot(x, x) * dot(y, y));
    return { key: b.key, label: b.label, basis: b.basis, fit: Math.round(50 + 50 * r) };
  }).sort((a, b) => b.fit - a.fit);
  return { kind: "fit", fits };
}
