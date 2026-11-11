import { getSupabaseServerClient } from "@/lib/supabase";
import { logAdminAction } from "@/lib/adminAuditLog";

const EMAIL_RE = /^[^\s@<>"'(),;]+@[^\s@<>"'(),;]+\.[a-z]{2,}$/;

export function parseEmailList(text: string): { valid: string[]; invalid: string[] } {
  const valid = new Set<string>();
  const invalid: string[] = [];
  for (const raw of text.split(/[\s,;]+/)) {
    // Unwrap pasted "Name <a@b.com>" / quoted / sentence-ending forms; anything else stored would never match a login.
    const email = raw.trim().toLowerCase().replace(/^[<"'(]+|[>"').]+$/g, "");
    if (!raw.trim()) continue;
    if (EMAIL_RE.test(email)) valid.add(email);
    else invalid.push(raw.trim());
  }
  return { valid: [...valid], invalid };
}

export async function isEmailAllowlisted(email: string | null | undefined): Promise<boolean> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  const { data, error } = await getSupabaseServerClient()
    .from("plan_allowlist")
    .select("email")
    .eq("email", normalized)
    .maybeSingle();
  if (error) throw new Error(`Failed to check plan allowlist: ${error.message}`);
  return Boolean(data);
}

export type AllowlistRow = { email: string; added_by: string; added_at: string; note: string | null };

export async function listAllowlist(): Promise<AllowlistRow[]> {
  const { data, error } = await getSupabaseServerClient()
    .from("plan_allowlist")
    .select("email, added_by, added_at, note")
    .order("added_at", { ascending: false });
  if (error) throw new Error(`Failed to list plan allowlist: ${error.message}`);
  return data ?? [];
}

// Returns how many emails were newly added; re-adding an existing email is a no-op.
export async function addToAllowlist(emails: string[], note: string | null, adminEmail: string): Promise<number> {
  if (emails.length === 0) return 0;
  const { data, error } = await getSupabaseServerClient()
    .from("plan_allowlist")
    .upsert(emails.map((email) => ({ email, added_by: adminEmail, note })), { onConflict: "email", ignoreDuplicates: true })
    .select("email");
  if (error) throw new Error(`Failed to add to plan allowlist: ${error.message}`);
  const added = (data ?? []).map((r) => r.email as string);
  for (const email of added) {
    await logAdminAction({ adminEmail, action: "plan_allowlist.add", targetType: "plan_allowlist", targetId: email, newValue: { note } });
  }
  return added.length;
}

// Removing never revokes a plan already bought (spec): it only stops new plan orders.
export async function removeFromAllowlist(email: string, adminEmail: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  const { error } = await getSupabaseServerClient().from("plan_allowlist").delete().eq("email", normalized);
  if (error) throw new Error(`Failed to remove from plan allowlist: ${error.message}`);
  await logAdminAction({ adminEmail, action: "plan_allowlist.remove", targetType: "plan_allowlist", targetId: normalized });
}
