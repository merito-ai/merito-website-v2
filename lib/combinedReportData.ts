import type { SupabaseClient } from "@supabase/supabase-js";
import { isReportUnlocked } from "@/lib/reportUnlocks";
import { getReferenceCheckStatus, computeReferenceReport } from "@/lib/referenceChecks";
import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";
import type { InterviewReportReady } from "@/lib/intervuebox/interviewReports";
import { nameFromEmail, type Scores } from "@/lib/personality";
import type { CultureScores } from "@/lib/psychometrics/scoring";
import { isPersonalityComplete } from "@/lib/psychometrics/testFlow";
import { leadIdOrRoleTitleFilter } from "@/lib/postgrestIdentityFilter";
import { readReportRaw } from "@/lib/intervuebox/reportRaw";

export type CombinedReportData = {
  fitment: { roleTitle: string; displayName: string; report: ResumeMatchReportReady } | null;
  personality: { scores: Scores; culture: { scores: CultureScores; reliable: boolean | null } | null } | null;
  interview: { roleTitle: string; report: InterviewReportReady; updatedAt: string } | null;
  references: ReturnType<typeof computeReferenceReport> | null;
  displayName: string;
  primaryRole: string;
};

// Works with either a session-scoped client (the authed combined-report
// page) or the service-role client (the public share page, which has no
// session to scope from) — every query here is already filtered by the
// explicit userId param, not by RLS, so either client returns the same
// rows for a given userId.
export async function loadCombinedReportData({
  supabase,
  userId,
  userEmail,
  include,
  roleTitleParam,
  includeLocked = false,
}: {
  supabase: SupabaseClient;
  userId: string;
  userEmail: string | null | undefined;
  include: Set<string>;
  roleTitleParam: string | null;
  /** Admin export only: include the fitment section even if the candidate hasn't unlocked it. */
  includeLocked?: boolean;
}): Promise<CombinedReportData> {
  // Fetched unconditionally (not gated by include.has("fitment")) because
  // fitment_leads.name is the only real-name source the public share page
  // has -- that page deliberately never passes a real userEmail (privacy:
  // no PII exposed to anonymous visitors), so when the fitment section
  // itself is excluded or still locked, this lookup is the only thing
  // standing between the displayed name and the generic email-less
  // nameFromEmail("") fallback ("You").
  // The lead for the requested role (a share link's frozen role), else the latest lead.
  const latestLead = async (role: string | null) => {
    let q = supabase.from("fitment_leads").select("id, role_title, name, resume_match_status, resume_match_raw").eq("user_id", userId);
    if (role) q = q.eq("role_title", role);
    const { data } = await q.order("created_at", { ascending: false }).limit(1);
    return data?.[0];
  };
  const currentLead = (roleTitleParam ? await latestLead(roleTitleParam) : undefined) ?? (await latestLead(null));

  let fitment: CombinedReportData["fitment"] = null;
  if (include.has("fitment") && currentLead) {
    const unlocked = includeLocked || (await isReportUnlocked(userId, currentLead.id, currentLead.role_title));
    if (unlocked && currentLead.resume_match_status === "READY" && currentLead.resume_match_raw) {
      fitment = {
        roleTitle: currentLead.role_title,
        displayName: currentLead.name || nameFromEmail(userEmail ?? ""),
        report: currentLead.resume_match_raw as ResumeMatchReportReady,
      };
    }
  }

  const roleTitle = roleTitleParam ?? fitment?.roleTitle ?? currentLead?.role_title ?? null;

  let personality: CombinedReportData["personality"] = null;
  if (include.has("personality")) {
    const { data: existing } = await supabase
      .from("personality_tests")
      .select("scores, validity, version, culture_scores, culture_reliable")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing?.scores && existing?.validity && isPersonalityComplete(existing)) {
      personality = {
        scores: existing.scores as Scores,
        culture: existing.culture_scores
          ? { scores: existing.culture_scores as CultureScores, reliable: existing.culture_reliable as boolean | null }
          : null,
      };
    }
  }

  // currentLead is the requested role's lead, or the LATEST lead when no lead
  // matches roleTitleParam, so roleTitle can still name a DIFFERENT, older role (the public
  // share page passes a role title frozen at share-link-creation time -- see
  // lib/reportShareTokens.ts). OR-ing currentLead.id together with a
  // requested roleTitle that belongs to a different lead would match
  // "interview linked to the LATEST lead OR interview matching the
  // REQUESTED role" -- two different leads' identities ORed together --
  // and .order("updated_at").limit(1) could then return the latest lead's
  // interview instead of the requested role's. Only use the lead_id half of
  // the identity match when currentLead actually IS the lead being asked
  // about; otherwise fall back to a plain role_title match.
  const identityLeadId = currentLead && currentLead.role_title === roleTitle ? currentLead.id : null;

  let interview: CombinedReportData["interview"] = null;
  if (include.has("interview")) {
    let query = supabase.from("fitment_interviews").select("role_title, status, report_raw, updated_at").eq("user_id", userId);
    if (roleTitle) {
      query = identityLeadId
        ? query.or(leadIdOrRoleTitleFilter(identityLeadId, roleTitle))
        : query.eq("role_title", roleTitle);
    }
    const { data: row } = await query.order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (row && row.status === "ready" && row.report_raw) {
      interview = { roleTitle: row.role_title, report: readReportRaw(row.report_raw), updatedAt: row.updated_at };
    }
  }

  let references: CombinedReportData["references"] = null;
  if (include.has("references")) {
    const status = await getReferenceCheckStatus(userId, { completedOnly: true });
    if (status?.status === "completed") {
      references = computeReferenceReport(status.referees);
    }
  }

  const displayName = fitment?.displayName || currentLead?.name || nameFromEmail(userEmail ?? "");
  const primaryRole = fitment?.roleTitle || interview?.roleTitle || roleTitle || "-";

  return { fitment, personality, interview, references, displayName, primaryRole };
}
