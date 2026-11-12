import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/intervuebox/client", () => ({ intervueBoxFetch: vi.fn() }));

import { redactLockedReport, LOCKED_PLACEHOLDER } from "@/lib/intervuebox/reports";

describe("redactLockedReport", () => {
  it("keeps scores, drops every piece of paid text", () => {
    const real = {
      overallScore: 72,
      rank: 3,
      categories: [{ key: "skillsMatch" as const, label: "Skills Match", score: 80, comment: "SECRET_comment" }],
      summary: "SECRET_summary",
      strongPoints: ["SECRET_strong"],
      weakPoints: ["SECRET_weak", "SECRET_weak2"],
    };
    const out = redactLockedReport(real);
    expect(out.overallScore).toBe(72);
    expect(out.rank).toBe(3);
    expect(out.categories).toEqual([{ key: "skillsMatch", label: "Skills Match", score: 80, comment: LOCKED_PLACEHOLDER }]);
    expect(JSON.stringify(out)).not.toContain("SECRET_");
    expect(out.strongPoints).toHaveLength(3);
    expect(out.weakPoints).toHaveLength(3);
  });
});
