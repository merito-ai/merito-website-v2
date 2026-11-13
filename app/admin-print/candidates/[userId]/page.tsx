import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabaseServerClient } from "@/lib/supabase";
import { loadCombinedReportData } from "@/lib/combinedReportData";
import CombinedReportDocument from "@/app/hub/account/combined-report/print/CombinedReportDocument";

// Admin copy of /hub/account/combined-report/print for any candidate, rendered to PDF by
// /api/admin/candidates/[userId]/export. Lives outside app/admin so the admin layout's chrome isn't printed.
const ALL_SECTIONS = new Set(["fitment", "personality", "interview", "references"]);
const INTERVIEW_SECTIONS = new Set(["scoreGauge", "overview", "skillReport", "criteriaMatch", "skillEvaluation", "strengths", "integrity", "roadmap"]);

export default async function AdminCandidateReportPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const { role } = await searchParams;

  const supabase = getSupabaseServerClient();
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  const data = await loadCombinedReportData({
    supabase,
    userId,
    userEmail: authUser?.user?.email,
    include: ALL_SECTIONS,
    roleTitleParam: typeof role === "string" ? role : null,
    includeLocked: true,
  });

  if (!data.fitment && !data.personality && !data.interview && !data.references) {
    notFound();
  }

  return <CombinedReportDocument data={data} interviewSections={INTERVIEW_SECTIONS} reportId={`MH-${userId.split("-")[0].toUpperCase()}`} />;
}
