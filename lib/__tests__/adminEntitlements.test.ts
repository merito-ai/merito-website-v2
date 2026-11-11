import { describe, it, expect, vi, beforeEach } from "vitest";

let tables: Record<string, unknown[]> = {};
function builder(table: string) {
  const b: Record<string, unknown> = {};
  for (const m of ["select", "eq", "order", "in"]) b[m] = () => b;
  b.then = (resolve: (v: unknown) => void) => resolve({ data: tables[table] ?? [] });
  return b;
}
vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: () => ({ from: (t: string) => builder(t) }) }));
const getPlanOrderMock = vi.fn();
vi.mock("@/lib/plans", async () => {
  const actual = await vi.importActual<typeof import("../plans")>("../plans");
  return { ...actual, getPlanOrder: getPlanOrderMock };
});

const lead = (id: string, role: string) => ({ id, role_title: role, candidate_level: "mid", created_at: "2026-01-01" });
const txn = (over: Record<string, unknown>) => ({ order_id: "o", product: "report", lead_id: null, amount_paise: 29900, status: "success", consumed_at: null, ...over });

describe("getCandidateEntitlements", () => {
  beforeEach(() => {
    getPlanOrderMock.mockReset();
    getPlanOrderMock.mockResolvedValue(null);
    tables = {};
  });

  it("gives per-role report and interview status, total paid and unused credits", async () => {
    tables = {
      fitment_leads: [lead("l1", "PM"), lead("l2", "SDE"), lead("l3", "QA")],
      razorpay_transactions: [
        txn({ order_id: "r1", product: "report", lead_id: "l1", consumed_at: "x" }),
        txn({ order_id: "i1", product: "interview", amount_paise: 99900 }),
        txn({ order_id: "i2", product: "interview", amount_paise: 0 }),
        txn({ order_id: "r3", product: "report", lead_id: "l3", status: "refunded" }),
        txn({ order_id: "x1", product: "interview", status: "initiated" }),
      ],
      report_unlocks: [{ lead_id: "l1" }, { lead_id: "l2" }],
      fitment_interviews: [
        { lead_id: "l1", role_title: "PM", status: "ready" },
        { lead_id: null, role_title: "SDE", status: "invited" },
      ],
    };
    const { getCandidateEntitlements } = await import("../adminEntitlements");
    const e = await getCandidateEntitlements("u1");

    const byRole = Object.fromEntries(e.roles.map((r) => [r.roleTitle, r]));
    expect(byRole.PM.report).toEqual({ label: "Unlocked, paid ₹299", tone: "success" });
    expect(byRole.SDE.report).toEqual({ label: "Unlocked, no payment found", tone: "warning" });
    expect(byRole.QA.report.label).toBe("Refunded");
    expect(byRole.PM.interview.label).toBe("Done");
    expect(byRole.SDE.interview.label).toBe("In progress");
    expect(byRole.QA.interview.label).toBe("Not started");
    expect(e.totalPaidPaise).toBe(29900 + 99900);
    expect(e.unusedInterviewCredits).toBe(2);
    expect(e.account.personality.label).toBe("Not bought");
  });

  it("counts Plan 2 mentoring sessions per row, not per order, and treats plan reports as included", async () => {
    getPlanOrderMock.mockResolvedValue({ orderId: "p1", product: "plan_mentor", interviewUsed: false });
    tables = {
      fitment_leads: [lead("l1", "PM")],
      razorpay_transactions: [txn({ order_id: "p1", product: "plan_mentor", amount_paise: 599500 })],
      report_unlocks: [{ lead_id: "l1" }],
      counselling_requests: [
        { order_id: "p1", session: 1, status: "completed" },
        { order_id: "p1", session: 2, status: "requested" },
      ],
      personality_tests: [{ version: 2, culture_scores: null }],
      reference_checks: [{ status: "completed" }],
    };
    const { getCandidateEntitlements } = await import("../adminEntitlements");
    const e = await getCandidateEntitlements("u1");

    expect(e.roles[0].report.label).toBe("Unlocked, in plan");
    expect(e.account.counselling).toEqual({ label: "2 sessions: 1 done, 1 to schedule", tone: "warning" });
    expect(e.account.plan.label).toBe("Assess + Mentor + Apply, paid ₹5,995");
    expect(e.account.personality.label).toBe("Bought, not finished");
    expect(e.account.references.label).toBe("Done");
    expect(e.unusedInterviewCredits).toBe(1);
  });

  it("labels free grants", async () => {
    tables = {
      fitment_leads: [lead("l1", "PM")],
      razorpay_transactions: [txn({ order_id: "comp_1", product: "report", lead_id: "l1", amount_paise: 0 })],
      report_unlocks: [{ lead_id: "l1" }],
    };
    const { getCandidateEntitlements } = await import("../adminEntitlements");
    expect((await getCandidateEntitlements("u1")).roles[0].report.label).toBe("Unlocked, free grant");
  });
});

describe("getBillingSummaries", () => {
  it("sums paid amounts, unused interview credits and roles per user", async () => {
    tables = {
      razorpay_transactions: [
        { user_id: "u1", product: "report", amount_paise: 29900, consumed_at: "x" },
        { user_id: "u1", product: "interview", amount_paise: 99900, consumed_at: null },
        { user_id: "u2", product: "plan_prepare", amount_paise: 0, consumed_at: null },
      ],
      fitment_leads: [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "u2" }],
    };
    const { getBillingSummaries } = await import("../adminEntitlements");
    const map = await getBillingSummaries(["u1", "u2", "u3"]);
    expect(map.get("u1")).toEqual({ paidPaise: 129800, unusedInterviewCredits: 1, roles: 2 });
    expect(map.get("u2")).toEqual({ paidPaise: 0, unusedInterviewCredits: 1, roles: 1 });
    expect(map.get("u3")).toEqual({ paidPaise: 0, unusedInterviewCredits: 0, roles: 0 });
  });
});
