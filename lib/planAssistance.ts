import { getSupabaseServerClient } from "@/lib/supabase";
import { getPlanOrder } from "@/lib/plans";
import { logAdminAction } from "@/lib/adminAuditLog";

// Plan 2 application assistance progress (table plan_assistance, migration 0073). No row = not contacted.
import type { AssistanceStatus } from "@/lib/planFeatures";
export type { AssistanceStatus };
export const ASSISTANCE_STATUSES = ["not_contacted", "in_progress", "done"] as const satisfies readonly AssistanceStatus[];

export type AssistanceRow = {
  userId: string;
  email: string;
  planSince: string;
  status: AssistanceStatus;
  companies: string | null;
  updatedAt: string | null;
};

export async function getAssistanceStatus(userId: string): Promise<AssistanceStatus> {
  const { data, error } = await getSupabaseServerClient().from("plan_assistance").select("status").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Failed to load assistance status: ${error.message}`);
  return (data?.status as AssistanceStatus | undefined) ?? "not_contacted";
}

// Every candidate whose effective plan is Plan 2 (bought outright or upgraded; refunds drop out via getPlanOrder).
// shortcut: one getPlanOrder per candidate, fine for seminar-sized volumes; move to SQL if it grows past a few hundred.
export async function listAssistance(): Promise<AssistanceRow[]> {
  const db = getSupabaseServerClient();
  const { data: txns, error } = await db
    .from("razorpay_transactions")
    .select("user_id, created_at")
    .eq("status", "success")
    .in("product", ["plan_mentor", "plan_upgrade_mentor"])
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to list Plan 2 holders: ${error.message}`);

  const since = new Map<string, string>();
  for (const t of txns ?? []) if (!since.has(t.user_id)) since.set(t.user_id, t.created_at);
  const userIds: string[] = [];
  for (const id of since.keys()) if ((await getPlanOrder(id))?.product === "plan_mentor") userIds.push(id);
  if (userIds.length === 0) return [];

  const [{ data: rows, error: rowsError }, { data: leads }] = await Promise.all([
    db.from("plan_assistance").select("user_id, status, companies, updated_at").in("user_id", userIds),
    db.from("fitment_leads").select("user_id, email").in("user_id", userIds),
  ]);
  if (rowsError) throw new Error(`Failed to load assistance rows: ${rowsError.message}`);
  const emails = new Map((leads ?? []).map((l) => [l.user_id, l.email as string]));
  for (const id of userIds) {
    if (!emails.has(id)) {
      const { data } = await db.auth.admin.getUserById(id); // plan bought before any fitment check
      emails.set(id, data?.user?.email ?? "Unknown email");
    }
  }
  const byUser = new Map((rows ?? []).map((r) => [r.user_id, r]));
  const order: Record<AssistanceStatus, number> = { not_contacted: 0, in_progress: 1, done: 2 };
  return userIds
    .map((id) => {
      const r = byUser.get(id);
      return {
        userId: id,
        email: emails.get(id)!,
        planSince: since.get(id)!,
        status: (r?.status as AssistanceStatus | undefined) ?? "not_contacted",
        companies: r?.companies ?? null,
        updatedAt: r?.updated_at ?? null,
      };
    })
    .sort((a, b) => order[a.status] - order[b.status] || a.planSince.localeCompare(b.planSince));
}

export async function setAssistance(userId: string, status: AssistanceStatus, companies: string | null, adminEmail: string): Promise<void> {
  const db = getSupabaseServerClient();
  if ((await getPlanOrder(userId))?.product !== "plan_mentor") throw new Error("This candidate has no active Plan 2.");
  const { data: prior } = await db.from("plan_assistance").select("status, companies").eq("user_id", userId).maybeSingle();
  const { error } = await db
    .from("plan_assistance")
    .upsert({ user_id: userId, status, companies, updated_by: adminEmail, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(`Failed to save assistance status: ${error.message}`);
  await logAdminAction({
    adminEmail,
    action: "assistance.status_change",
    targetType: "candidate",
    targetId: userId,
    priorValue: prior ?? null,
    newValue: { status, companies },
  }).catch((err) => console.error("Failed to log assistance.status_change", { userId, err }));
}
