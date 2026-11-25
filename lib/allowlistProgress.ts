import { getSupabaseServerClient } from "@/lib/supabase";
import type { AllowlistRow } from "@/lib/planAllowlist";
import { planFromTransactions, PLAN_PRODUCTS, PLAN_UPGRADE, type PlanProduct, type PlanTxn } from "@/lib/plans";
import { mentoringSessions, type MentoringRow } from "@/lib/planPanel";
import { isPersonalityComplete } from "@/lib/psychometrics/testFlow";
import type { AssistanceStatus } from "@/lib/planFeatures";

// Admin plan-allowlist progress: how far each invited (seminar) email got. Reads only.

export type AuthUser = { id: string; email?: string | null; created_at: string; last_sign_in_at?: string | null };
type ByUser<T> = { user_id: string } & T;

export type ProgressInput = {
  allowlist: AllowlistRow[];
  users: AuthUser[];
  leads: ByUser<object>[];
  txns: ByUser<PlanTxn>[];
  personality: ByUser<{ version?: number | null; culture_scores?: unknown }>[];
  references: ByUser<{ status: string; created_at: string }>[];
  interviews: ByUser<{ status: string; ib_interview_status?: string | null; updated_at: string }>[];
  mentoring: ({ order_id: string } & MentoringRow)[];
  assistance: ByUser<{ status: string }>[];
};

export type ProgressRow = AllowlistRow & {
  userId: string | null;
  signedUpAt: string | null;
  lastSignInAt: string | null;
  roles: number;
  plan: { product: PlanProduct; since: string } | null;
  personalityDone: boolean;
  references: "none" | "waiting" | "done";
  interview: "none" | "invited" | "started" | "done" | "ended";
  mentoring: [string, string] | null; // Plan 2 only: session 1 + follow-up states
  assistance: AssistanceStatus | null; // Plan 2 only
};

const latest = <T extends { user_id: string }>(rows: T[], at: (r: T) => string) => {
  const m = new Map<string, T>();
  for (const r of rows) {
    const cur = m.get(r.user_id);
    if (!cur || Date.parse(at(r)) > Date.parse(at(cur))) m.set(r.user_id, r);
  }
  return m;
};

const group = <T extends { user_id: string }>(rows: T[]) => {
  const m = new Map<string, T[]>();
  for (const r of rows) m.set(r.user_id, [...(m.get(r.user_id) ?? []), r]);
  return m;
};

export function buildAllowlistProgress(i: ProgressInput): ProgressRow[] {
  const userByEmail = new Map(i.users.filter((u) => u.email).map((u) => [u.email!.trim().toLowerCase(), u]));
  const txns = group(i.txns);
  const personality = new Map(i.personality.map((p) => [p.user_id, p]));
  const refs = latest(i.references, (r) => r.created_at);
  const interviews = latest(i.interviews, (r) => r.updated_at);
  const assistance = new Map(i.assistance.map((a) => [a.user_id, a.status as AssistanceStatus]));
  const roles = new Map<string, number>();
  for (const l of i.leads) roles.set(l.user_id, (roles.get(l.user_id) ?? 0) + 1);

  return i.allowlist.map((a) => {
    const u = userByEmail.get(a.email);
    const id = u?.id ?? null;
    const plan = id ? planFromTransactions(txns.get(id) ?? []) : null;
    const mentor = plan?.product === "plan_mentor";
    const order = plan?.upgradeOrderId ?? plan?.orderId;
    const iv = id ? interviews.get(id) : undefined;
    const ref = id ? refs.get(id) : undefined;
    const [s1, s2] = mentoringSessions(i.mentoring.filter((m) => m.order_id === order));
    return {
      ...a,
      userId: id,
      signedUpAt: u?.created_at ?? null,
      lastSignInAt: u?.last_sign_in_at ?? null,
      roles: id ? roles.get(id) ?? 0 : 0,
      plan: plan ? { product: plan.product, since: plan.since } : null,
      personalityDone: id ? isPersonalityComplete(personality.get(id)) : false,
      references: !ref ? "none" : ref.status === "completed" ? "done" : "waiting",
      interview: !iv ? "none" : iv.status === "ready" ? "done" : iv.status === "terminated" ? "ended" : iv.ib_interview_status === "APPEARED" ? "started" : "invited",
      mentoring: mentor ? [s1.state, s2.state] : null,
      assistance: mentor ? assistance.get(id!) ?? "not_contacted" : null,
    };
  });
}

export function summarizeProgress(rows: ProgressRow[]) {
  const n = (f: (r: ProgressRow) => boolean) => rows.filter(f).length;
  return {
    invited: rows.length,
    signedIn: n((r) => r.lastSignInAt !== null),
    plan: n((r) => r.plan !== null),
    personality: n((r) => r.personalityDone),
    references: n((r) => r.references === "done"),
    interview: n((r) => r.interview === "done"),
  };
}

// Paginated sweep of auth users (same loop as adminCandidates' banned-user sweep).
async function listAllAuthUsers(db: ReturnType<typeof getSupabaseServerClient>): Promise<AuthUser[]> {
  const out: AuthUser[] = [];
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Failed to list users: ${error.message}`);
    const users = data?.users ?? [];
    out.push(...users);
    if (users.length < perPage) return out;
  }
}

export async function loadAllowlistProgress(allowlist: AllowlistRow[]): Promise<ProgressRow[]> {
  const db = getSupabaseServerClient();
  const emails = new Set(allowlist.map((a) => a.email));
  const users = (await listAllAuthUsers(db)).filter((u) => u.email && emails.has(u.email.trim().toLowerCase()));
  const ids = users.map((u) => u.id);
  const empty: ProgressInput = { allowlist, users, leads: [], txns: [], personality: [], references: [], interviews: [], mentoring: [], assistance: [] };
  if (ids.length === 0) return buildAllowlistProgress(empty);

  const must = <T,>(label: string, r: { data: T[] | null; error: { message: string } | null }) => {
    if (r.error) throw new Error(`Failed to load ${label}: ${r.error.message}`);
    return r.data ?? [];
  };
  const [leads, txns, personality, references, interviews, assistance] = await Promise.all([
    db.from("fitment_leads").select("user_id").in("user_id", ids).then((r) => must("fitment leads", r)),
    db
      .from("razorpay_transactions")
      .select("user_id, order_id, product, consumed_at, created_at")
      .in("user_id", ids)
      .eq("status", "success") // refunded rows drop out, as in getPlanOrder
      .in("product", [...PLAN_PRODUCTS, PLAN_UPGRADE])
      .then((r) => must("plan orders", r)),
    db.from("personality_tests").select("user_id, version, culture_scores").in("user_id", ids).then((r) => must("personality tests", r)),
    db.from("reference_checks").select("user_id, status, created_at").in("user_id", ids).then((r) => must("reference checks", r)),
    db.from("fitment_interviews").select("user_id, status, ib_interview_status, updated_at").in("user_id", ids).then((r) => must("interviews", r)),
    // Not fatal, like the hub plan panel: a read error just shows the default status.
    db.from("plan_assistance").select("user_id, status").in("user_id", ids).then((r) => r.data ?? []),
  ]);

  // Every plan order's sessions; buildAllowlistProgress picks the one order each Plan 2 holder's mentoring hangs off.
  const orderIds = txns.map((t) => t.order_id);
  const mentoring = orderIds.length
    ? must("mentoring sessions", await db.from("counselling_requests").select("order_id, session, status, scheduled_at").in("order_id", orderIds))
    : [];
  return buildAllowlistProgress({ ...empty, leads, txns, personality, references, interviews, assistance, mentoring });
}
