import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { loadCombinedReportData } from "@/lib/combinedReportData";
import CombinedReportDocument from "./CombinedReportDocument";

export default async function CombinedReportPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  const params = await searchParams;
  const includeParam = typeof params.include === "string" ? params.include : "fitment,personality,interview,references";
  const include = new Set(includeParam.split(",").filter(Boolean));
  const roleTitleParam = typeof params.role === "string" ? params.role : null;
  const DEFAULT_INTERVIEW_SECTIONS =
    "scoreGauge,overview,skillReport,criteriaMatch,skillEvaluation,strengths,integrity,roadmap";
  const interviewSectionsParam = typeof params.interviewSections === "string" ? params.interviewSections : DEFAULT_INTERVIEW_SECTIONS;
  const interviewSections = new Set(interviewSectionsParam.split(",").filter(Boolean));

  const data = await loadCombinedReportData({
    supabase,
    userId: user.id,
    userEmail: user.email,
    include,
    roleTitleParam,
  });

  if (!data.fitment && !data.personality && !data.interview && !data.references) {
    redirect("/hub/account");
  }

  return (
    <CombinedReportDocument
      data={data}
      interviewSections={interviewSections}
      reportId={`MH-${user.id.split("-")[0].toUpperCase()}`}
    />
  );
}
