import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/reportUnlocks", () => ({ isReportUnlocked: vi.fn() }));
vi.mock("@/lib/referenceChecks", () => ({ getReferenceCheckStatus: vi.fn(), computeReferenceReport: vi.fn() }));

import { loadCombinedReportData } from "../combinedReportData";

const t = { raw: 30, pct: 50, band: 2 };
const scores = { E: t, A: t, C: t, ES: t, O: t };
const validity = { meanRaw: 3, pctMid: 10, incon: 0.5, sd: 2 };

function client(personalityRow: unknown) {
  const select = vi.fn();
  const from = vi.fn((table: string) => {
    if (table === "fitment_leads") {
      return { select: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: [] }) }) }) }) };
    }
    if (table === "personality_tests") {
      select.mockReturnValue({ eq: () => ({ maybeSingle: async () => ({ data: personalityRow }) }) });
      return { select };
    }
    throw new Error(`Unexpected table ${table}`);
  });
  return { supabase: { from } as never, select };
}

const load = (supabase: never) =>
  loadCombinedReportData({ supabase, userId: "u1", userEmail: null, include: new Set(["personality"]), roleTitleParam: null });

describe("loadCombinedReportData personality", () => {
  it("selects culture columns and returns culture for a completed v2 row", async () => {
    const culture = { Clan: 70, Adhocracy: 40, Market: 30, Hierarchy: 20 };
    const { supabase, select } = client({ scores, validity, version: 2, culture_scores: culture, culture_reliable: true });
    const data = await load(supabase);
    expect(select.mock.calls[0][0]).toContain("culture_scores");
    expect(select.mock.calls[0][0]).toContain("culture_reliable");
    expect(data.personality).toEqual({ scores, culture: { scores: culture, reliable: true } });
  });
  it("v1 row -> culture null", async () => {
    const { supabase } = client({ scores, validity, version: 1, culture_scores: null, culture_reliable: null });
    expect((await load(supabase)).personality).toEqual({ scores, culture: null });
  });
  it("v2 row with only Part 1 -> no personality section", async () => {
    const { supabase } = client({ scores, validity, version: 2, culture_scores: null, culture_reliable: null });
    expect((await load(supabase)).personality).toBeNull();
  });
});
