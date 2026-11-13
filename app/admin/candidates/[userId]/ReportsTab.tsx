"use client";

import { useState } from "react";
import ResumeMatchGauge from "@/app/hub/account/report/ResumeMatchGauge";
import ResumeMatchCategoryCard from "@/app/hub/account/report/ResumeMatchCategoryCard";
import CandidateStatsCard from "@/app/hub/account/report/CandidateStatsCard";
import CandidateProfile from "@/app/hub/account/report/CandidateProfile";
import InterviewScoreGauge from "@/app/hub/account/interview/InterviewScoreGauge";
import ParameterScoreTile from "@/app/hub/account/interview/ParameterScoreTile";
import CriteriaMatchCard from "@/app/hub/account/interview/CriteriaMatchCard";
import SkillReportTable from "@/app/hub/account/interview/SkillReportTable";
import AnswerTranscript from "@/app/hub/account/interview/AnswerTranscript";
import RoadmapTimeline from "@/app/hub/account/RoadmapTimeline";
import EvaluatorNotes from "@/app/hub/account/EvaluatorNotes";
import PersonalityReport from "@/app/hub/account/personality/PersonalityReport";
import InterviewRecoveryActions from "./InterviewRecoveryActions";
import ResumeMatchRetry from "./ResumeMatchRetry";
import FitmentOverrideForm from "./FitmentOverrideForm";
import InterviewOverrideForm from "./InterviewOverrideForm";
import InterviewResync from "./InterviewResync";
import VendorCompare from "./VendorCompare";
import { interviewHeadlineScore } from "@/lib/intervuebox/reportRaw";
import type { CandidateLeadDetail, CandidateDetail } from "@/lib/adminCandidates";

const emptyNote: React.CSSProperties = { fontSize: 13 };
const pillBase: React.CSSProperties = {
  fontSize: 13,
  padding: "6px 14px",
  borderRadius: 20,
  border: "1px solid #dcdcdc",
  background: "transparent",
  cursor: "pointer",
  marginRight: 8,
};

function ReportHeading({ title, score }: { title: string; score: string }) {
  return (
    <div className="flex items-baseline justify-between" style={{ gap: 12, marginBottom: 10 }}>
      <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.05rem", margin: 0 }}>
        {title}
      </h3>
      <span className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13 }}>
        {score}
      </span>
    </div>
  );
}

export default function ReportsTab({
  email,
  candidateName,
  leads,
  personality,
}: {
  email: string;
  candidateName: string;
  leads: CandidateLeadDetail[];
  personality: CandidateDetail["personality"];
}) {
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const lead = leads.find((l) => l.id === selectedLeadId) ?? leads[0];

  return (
    <div>
      {leads.length > 1 && lead && (
        <div style={{ marginBottom: 20 }}>
          {leads.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedLeadId(l.id)}
              className="font-[family-name:var(--font-poppins)]"
              style={{
                ...pillBase,
                color: l.id === lead.id ? "#ed1a24" : "#4b4b4d",
                borderColor: l.id === lead.id ? "#ed1a24" : "#dcdcdc",
              }}
            >
              {l.roleTitle}
            </button>
          ))}
        </div>
      )}

      {!lead && (
        <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={emptyNote}>
          No applications yet.
        </p>
      )}

      {lead && (
        <>
          {lead.fitmentReport ? (
            <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: 20, margin: "0 0 20px" }}>
              <ReportHeading title="Fitment report" score={`${lead.fitmentReport.overallScore}/100`} />
              <div className="flex items-start" style={{ gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <FitmentOverrideForm
                  leadId={lead.id}
                  overallScore={lead.fitmentReport.overallScore}
                  summary={lead.fitmentReport.summary}
                  overridden={lead.fitmentOverridden}
                  overrideHistory={lead.fitmentOverrideHistory}
                />
                {!lead.fitmentOverridden && <ResumeMatchRetry leadId={lead.id} />}
                <VendorCompare compareUrl={`/api/admin/leads/${lead.id}/vendor-compare`} />
              </div>
              <p className="font-[family-name:var(--font-poppins)] text-black" style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>
                {lead.fitmentReport.summary}
              </p>
              <details>
                <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
                  Show full report
                </summary>
                <div className="flex items-center justify-center" style={{ margin: "12px 0 16px" }}>
                  <ResumeMatchGauge percent={lead.fitmentReport.overallScore} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
                  {lead.fitmentReport.categories.map((category) => (
                    <ResumeMatchCategoryCard key={category.key} category={category} />
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: 20, margin: "0 0 20px" }}>
              <ReportHeading title="Fitment report" score="Not ready yet" />
              <ResumeMatchRetry leadId={lead.id} />
            </div>
          )}

          {lead.interviewReport ? (
            <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: 20, margin: "0 0 20px" }}>
              <ReportHeading title="Interview report" score={`${interviewHeadlineScore(lead.interviewReport)}/100`} />
              {lead.interviewRow && (
                <div className="flex items-start" style={{ gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                  <InterviewOverrideForm
                    interviewRowId={lead.interviewRow.id}
                    overallScore={interviewHeadlineScore(lead.interviewReport)}
                    overallSummary={lead.interviewReport.overallSummary}
                    overridden={lead.interviewOverridden}
                    overrideHistory={lead.interviewOverrideHistory}
                  />
                  {!lead.interviewOverridden && <InterviewResync interviewRowId={lead.interviewRow.id} />}
                  <VendorCompare compareUrl={`/api/admin/interviews/${lead.interviewRow.id}/vendor-compare`} />
                </div>
              )}
              <p className="font-[family-name:var(--font-poppins)] text-black" style={{ fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>
                {lead.interviewReport.overallSummary}
              </p>
              <details>
                <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
                  Show full report and answers
                </summary>
                <div className="flex items-center justify-center" style={{ margin: "12px 0 16px" }}>
                  <InterviewScoreGauge score={interviewHeadlineScore(lead.interviewReport)} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginBottom: 16 }}>
                  {Object.entries(lead.interviewReport.skillMetrics ?? {}).map(([skill, score]) => (
                    <ParameterScoreTile key={skill} skill={skill} score={score} />
                  ))}
                </div>
                {Object.keys(lead.interviewReport.skillReport).length > 0 && (
                  <SkillReportTable skillReport={lead.interviewReport.skillReport} />
                )}
                {typeof lead.interviewReport.skillMetrics?.criteriaMatch === "number" && (
                  <CriteriaMatchCard
                    criteriaMatchScore={lead.interviewReport.skillMetrics.criteriaMatch}
                    criteriaEvaluationTable={lead.interviewReport.criteriaEvaluationTable}
                  />
                )}
                {lead.interviewReport.roadmap && <RoadmapTimeline roadmap={lead.interviewReport.roadmap} />}
                {lead.interviewReport.feedbackToInterviewer && <EvaluatorNotes notes={lead.interviewReport.feedbackToInterviewer} />}
                <AnswerTranscript answers={lead.interviewReport.answers} />
              </details>
            </div>
          ) : (
            <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: 20, margin: "0 0 20px" }}>
              <ReportHeading title="Interview report" score={lead.interviewRow ? "Not finished yet" : "Not started"} />
              {lead.interviewRow && <InterviewRecoveryActions interviewId={lead.interviewRow.id} status={lead.interviewRow.status} />}
            </div>
          )}

          {(lead.candidateDetails || lead.resumeText) && (
            <details>
              <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
                Resume and profile
              </summary>
              <div style={{ marginTop: 12 }}>
                {lead.candidateDetails && (
                  <CandidateStatsCard
                    email={email}
                    phoneNumber={lead.candidateDetails.phoneNumber}
                    location={lead.candidateDetails.location}
                    totalExperience={lead.candidateDetails.totalExperience}
                    experience={lead.candidateDetails.experience}
                  />
                )}
                {lead.candidateDetails && (
                  <CandidateProfile
                    education={lead.candidateDetails.education}
                    experience={lead.candidateDetails.experience}
                    certifications={lead.candidateDetails.certifications}
                    projects={lead.candidateDetails.projects}
                  />
                )}
                {lead.resumeText && (
                  <pre
                    className="font-[family-name:var(--font-poppins)] bg-white border border-black/[0.08] text-black"
                    style={{ fontSize: 12, lineHeight: 1.6, padding: 14, borderRadius: 10, whiteSpace: "pre-wrap", marginTop: 8 }}
                  >
                    {lead.resumeText}
                  </pre>
                )}
              </div>
            </details>
          )}
        </>
      )}

      <div style={{ marginTop: 40 }}>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.1rem", margin: "0 0 14px" }}>
          Personality
        </h3>
        {personality ? (
          <PersonalityReport candidateName={candidateName} roleTitle={personality.roleTitle} scores={personality.scores} validity={personality.validity} culture={personality.culture} />
        ) : (
          <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={emptyNote}>
            Not taken yet.
          </p>
        )}
      </div>
    </div>
  );
}
