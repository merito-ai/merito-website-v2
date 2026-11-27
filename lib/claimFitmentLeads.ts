import { getSupabaseServerClient } from "@/lib/supabase";

// ilike treats % and _ as wildcards. Best effort only: a 2026-11-27 prod probe showed escaped _ and % still matching
// any character, so the exact email compare after each ilike is the real guard. Escaping never drops a true match.
export const escapeLike = (value: string) => value.replace(/[\\%_]/g, "\\$&");

export async function claimFitmentLeads(userId: string, email: string): Promise<{ claimedCount: number }> {
  const supabase = getSupabaseServerClient();
  const wanted = email.trim().toLowerCase();

  const { data: candidates, error: findError } = await supabase
    .from("fitment_leads")
    .select("id, email")
    .ilike("email", escapeLike(wanted))
    .is("user_id", null);
  if (findError) {
    throw new Error(`Failed to claim fitment leads: ${findError.message}`);
  }

  // Keep exact matches only: wildcards (incl. PostgREST's * alias) can still widen the ilike result.
  const ids = (candidates ?? []).filter((r) => r.email.trim().toLowerCase() === wanted).map((r) => r.id);
  if (ids.length === 0) return { claimedCount: 0 };

  const { data, error } = await supabase.from("fitment_leads").update({ user_id: userId }).in("id", ids).is("user_id", null).select("id");

  if (error) {
    throw new Error(`Failed to claim fitment leads: ${error.message}`);
  }

  return { claimedCount: data?.length ?? 0 };
}
