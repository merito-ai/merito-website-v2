import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({ getSupabaseServerClient: vi.fn() }));

import { buildAllowlistProgress, summarizeProgress, type ProgressInput } from "@/lib/allowlistProgress";
import { planFromTransactions } from "@/lib/plans";

const entry = (email: string, note: string | null = "IIMA") => ({ email, note, added_by: "admin@merito.ai", added_at: "2026-11-01T00:00:00Z" });
const input = (over: Partial<ProgressInput> = {}): ProgressInput => ({
  allowlist: [entry("a@x.com"), entry("b@x.com")],
  users: [{ id: "u1", email: "A@X.com", created_at: "2026-11-02T00:00:00Z", last_sign_in_at: "2026-11-03T00:00:00Z" }],
  leads: [],
  txns: [],
  personality: [],
  references: [],
  interviews: [],
  mentoring: [],
  assistance: [],
  ...over,
});
const txn = (order_id: string, product: string, created_at: string, consumed_at: string | null = null) => ({ order_id, product, created_at, consumed_at });

describe("planFromTransactions (mirrors getPlanOrder)", () => {
  it("no plan rows -> null; upgrade alone is not a plan", () => {
    expect(planFromTransactions([])).toBeNull();
    expect(planFromTransactions([txn("up", "plan_upgrade_mentor", "2026-11-05T00:00:00Z")])).toBeNull();
  });
  it("newest base plan wins; consumed marks the interview used", () => {
    expect(planFromTransactions([txn("o1", "plan_prepare", "2026-11-01T00:00:00Z"), txn("o2", "plan_mentor", "2026-11-04T00:00:00Z", "2026-11-05T00:00:00Z")])).toEqual({
      orderId: "o2",
      product: "plan_mentor",
      interviewUsed: true,
      since: "2026-11-04T00:00:00Z",
    });
  });
  it("upgrade after plan_prepare lifts it to plan_mentor; an older upgrade does not", () => {
    const base = txn("o1", "plan_prepare", "2026-11-04T00:00:00Z");
    expect(planFromTransactions([base, txn("up", "plan_upgrade_mentor", "2026-11-06T00:00:00Z")])).toMatchObject({ product: "plan_mentor", orderId: "o1", upgradeOrderId: "up" });
    expect(planFromTransactions([base, txn("up", "plan_upgrade_mentor", "2026-11-01T00:00:00Z")])).toMatchObject({ product: "plan_prepare" });
  });
});

describe("buildAllowlistProgress", () => {
  it("matches auth users by lowercased email; unknown emails are not signed up", () => {
    const [a, b] = buildAllowlistProgress(input());
    expect(a).toMatchObject({ userId: "u1", signedUpAt: "2026-11-02T00:00:00Z", lastSignInAt: "2026-11-03T00:00:00Z", plan: null, references: "none", interview: "none", mentoring: null, assistance: null });
    expect(b).toMatchObject({ userId: null, signedUpAt: null, roles: 0, personalityDone: false });
  });

  it("counts roles, reads personality, latest reference check and latest interview", () => {
    const [a] = buildAllowlistProgress(
      input({
        leads: [{ user_id: "u1" }, { user_id: "u1" }, { user_id: "other" }],
        personality: [{ user_id: "u1", version: 2, culture_scores: { x: 1 } }],
        references: [
          { user_id: "u1", status: "completed", created_at: "2026-11-01T00:00:00Z" },
          { user_id: "u1", status: "pending", created_at: "2026-11-05T00:00:00Z" },
        ],
        interviews: [
          { user_id: "u1", status: "ready", updated_at: "2026-11-01T00:00:00Z" },
          { user_id: "u1", status: "invited", ib_interview_status: "APPEARED", updated_at: "2026-11-06T00:00:00Z" },
        ],
      }),
    );
    expect(a).toMatchObject({ roles: 2, personalityDone: true, references: "waiting", interview: "started" });
  });

  it("personality part 1 only is not done", () => {
    expect(buildAllowlistProgress(input({ personality: [{ user_id: "u1", version: 2, culture_scores: null }] }))[0].personalityDone).toBe(false);
  });

  it("Plan 1: plan + date, no mentoring or assistance", () => {
    const [a] = buildAllowlistProgress(input({ txns: [{ user_id: "u1", ...txn("o1", "plan_prepare", "2026-11-04T00:00:00Z") }] }));
    expect(a).toMatchObject({ plan: { product: "plan_prepare", since: "2026-11-04T00:00:00Z" }, mentoring: null, assistance: null });
  });

  it("upgraded Plan 2: mentoring keyed on the upgrade order, assistance defaults to not contacted", () => {
    const [a] = buildAllowlistProgress(
      input({
        txns: [{ user_id: "u1", ...txn("o1", "plan_prepare", "2026-11-04T00:00:00Z") }, { user_id: "u1", ...txn("up", "plan_upgrade_mentor", "2026-11-06T00:00:00Z") }],
        mentoring: [
          { order_id: "up", session: 1, status: "completed", scheduled_at: null },
          { order_id: "o1", session: 1, status: "cancelled", scheduled_at: null },
        ],
      }),
    );
    expect(a.plan?.product).toBe("plan_mentor");
    expect(a.mentoring).toEqual(["Completed", "Unlocked, not booked yet"]);
    expect(a.assistance).toBe("not_contacted");
  });

  it("Plan 2 assistance status comes from plan_assistance", () => {
    const [a] = buildAllowlistProgress(
      input({ txns: [{ user_id: "u1", ...txn("o2", "plan_mentor", "2026-11-04T00:00:00Z") }], assistance: [{ user_id: "u1", status: "in_progress" }] }),
    );
    expect(a.assistance).toBe("in_progress");
  });
});

describe("summarizeProgress", () => {
  it("counts the filtered set", () => {
    const rows = buildAllowlistProgress(
      input({
        txns: [{ user_id: "u1", ...txn("o1", "plan_prepare", "2026-11-04T00:00:00Z") }],
        references: [{ user_id: "u1", status: "completed", created_at: "2026-11-01T00:00:00Z" }],
        interviews: [{ user_id: "u1", status: "ready", updated_at: "2026-11-01T00:00:00Z" }],
      }),
    );
    expect(summarizeProgress(rows)).toEqual({ invited: 2, signedIn: 1, plan: 1, personality: 0, references: 1, interview: 1 });
  });
});
