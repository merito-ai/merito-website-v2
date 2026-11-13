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

describe("loadCombinedReportData fitment lead", () => {
  const leadA = { id: "A", role_title: "Analyst", name: "Asha", resume_match_status: "READY", resume_match_raw: { categories: [] } };
  const leadB = { ...leadA, id: "B", role_title: "Designer" }; // latest
  function leadsClient() {
    const from = vi.fn(() => {
      const filters: Record<string, string> = {};
      const q = {
        select: () => q,
        eq: (col: string, v: string) => ((filters[col] = v), q),
        order: () => q,
        limit: async () => ({ data: [leadB, leadA].filter((l) => !filters.role_title || l.role_title === filters.role_title).slice(0, 1) }),
      };
      return q;
    });
    return { from } as never;
  }
  const loadFitment = (roleTitleParam: string | null) =>
    loadCombinedReportData({ supabase: leadsClient(), userId: "u1", userEmail: null, include: new Set(["fitment"]), roleTitleParam });

  it("uses the lead for the share link's role, not the latest lead", async () => {
    const { isReportUnlocked } = await import("@/lib/reportUnlocks");
    vi.mocked(isReportUnlocked).mockResolvedValue(true);
    expect((await loadFitment("Analyst")).fitment?.roleTitle).toBe("Analyst");
    expect(isReportUnlocked).toHaveBeenLastCalledWith("u1", "A", "Analyst");
  });
  it("falls back to the latest lead when no role is stored or no lead matches", async () => {
    expect((await loadFitment(null)).fitment?.roleTitle).toBe("Designer");
    expect((await loadFitment("Gone")).fitment?.roleTitle).toBe("Designer");
  });
  it("drops a locked fitment section unless includeLocked (admin export)", async () => {
    const { isReportUnlocked } = await import("@/lib/reportUnlocks");
    vi.mocked(isReportUnlocked).mockResolvedValue(false);
    expect((await loadFitment(null)).fitment).toBeNull();
    const admin = await loadCombinedReportData({
      supabase: leadsClient(), userId: "u1", userEmail: null, include: new Set(["fitment"]), roleTitleParam: null, includeLocked: true,
    });
    expect(admin.fitment?.roleTitle).toBe("Designer");
  });
});
