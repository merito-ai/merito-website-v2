import type { InterviewReportReady } from "@/lib/intervuebox/interviewReports";

// Fictional candidate (Ananya Iyer, Product Analyst). Typed against the
// production report type: if the vendor mapping changes shape, this fails
// to compile instead of rendering a stale sample.
// NOTE: overallScore and skillMetrics are 0-100, not 0-10. The "0-10" comment
// on InterviewReportReady is stale: InterviewScoreGauge clamps to 100 and
// ParameterScoreTile renders the raw number with a "%" suffix, and a real
// exported report shows 50% overall / 58% relevance.
export const SAMPLE_INTERVIEW_REPORT: InterviewReportReady = {
  overallScore: 68,
  skillMetrics: {
    Relevance: 74,
    Confidence: 61,
    Correctness: 70,
    Communication: 65,
    "Problem Solving": 72,
  },
  overallSummary:
    "Answers were structured and mostly on-target, with clear reasoning on the metrics questions. Confidence dipped noticeably on the experimentation prompts, where hedging replaced a direct answer. Examples were real but under-quantified — outcomes were described qualitatively where numbers would have carried more weight.",
  strengths:
    "- Structured answers with a clear beginning, middle and conclusion.\n- Comfortable reasoning aloud through an unfamiliar metrics question.\n- Concrete, real examples rather than hypotheticals.",
  areasOfImprovement:
    "- **Quantification**: outcomes were described in words where numbers were available and expected.\n- **Experiment design**: hedged on sample sizing and stopping rules rather than committing to an approach.\n- **Concision**: two answers ran past three minutes without a summary line.",
  shareableReportLink: null,
  approxDurationMinutes: 21,
  flagForSuspiciousActivity: false,
  integrityCheck: "No issues detected during this interview.",
  videoReport: null,
  feedbackToInterviewer:
    "STRENGTHS: Sound analytical instincts and a habit of stating assumptions before answering. WEAKNESSES: Limited experimentation depth; outcomes under-quantified. OPPORTUNITIES: A short course on experiment design would close the most visible gap. THREATS: May struggle in a role where owning an A/B programme is a week-one expectation. RECOMMENDATION: Worth a further round if the experimentation gap is probed directly.",
  roadmap:
    "Short-Term (0-2 months) — GOAL: Close the experimentation gap. Focus: sample sizing, power, stopping rules. What to do: run two end-to-end experiments on a public dataset and write up the decision each produced.\nMid-Term (2-4 months) — GOAL: Quantify your own impact. Focus: rebuild every CV bullet around a number and the decision it drove.\nLong-Term (4-6+ months) — GOAL: Move from reporting to owning. Focus: take one metric end to end, from definition through to the call you made on it.",
  opportunities: null,
  threats: null,
  criteriaEvaluationTable: [],
  interviewTitle: "Product Analyst",
  skillReport: {
    "Metrics reasoning": {
      score: 72,
      comment:
        "Defined activation and retention correctly and reasoned through a funnel drop-off without prompting, though the link to a business decision stayed implicit.",
    },
    Communication: {
      score: 61,
      comment:
        "Clear and well-paced overall. Two answers lost their thread partway and would have benefited from a closing summary line.",
    },
    "Experiment design": {
      score: 48,
      comment:
        "Recognised when an experiment was warranted but could not commit to a sample size or a stopping rule when pressed.",
    },
  },
  overallSkillScore: 64,
  answers: [],
  knowledgeAnswers: [],
  whatToFocusOnNext: null,
  trainingFocus: null,
  confidenceLevel: null,
  presentation: null,
  bodyLanguage: null,
  environmentCheck: null,
  responseQuality: null,
  tabChanges: null,
};
