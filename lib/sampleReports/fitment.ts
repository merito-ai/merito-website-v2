import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";

// Fictional candidate (Ananya Iyer, Product Analyst) used as the fallback
// preview when a candidate's own fitment report hasn't generated yet. Typed
// against the production report type so a shape change fails the build here
// rather than silently rendering a stale sample.
export const SAMPLE_FITMENT_REPORT: ResumeMatchReportReady = {
  overallScore: 84,
  rank: null,
  summary:
    "Strong analytical foundation and clear product instincts, backed by relevant coursework and two years of hands-on analytics work. Gaps show up in experiment design at scale and in owning a metric end to end rather than reporting on it.",
  categories: [
    {
      key: "locationMatch",
      label: "Location Match",
      score: 100,
      comment:
        "Based in Bengaluru and the role is hybrid in the same city, so there is no relocation or timezone friction to work through.",
    },
    {
      key: "educationMatch",
      label: "Education Match",
      score: 92,
      comment:
        "A Bachelor's in Statistics with electives in econometrics maps directly onto the quantitative reasoning this role leans on, and the capstone on retention modelling is close to the day-to-day work.",
    },
    {
      key: "skillsMatch",
      label: "Skills Match",
      score: 86,
      comment:
        "SQL, Python and dashboarding are all evidenced with specifics rather than listed. Missing: experimentation tooling and any sign of statistical power calculations, both named explicitly in the JD.",
    },
    {
      key: "experienceMatch",
      label: "Experience Match",
      score: 78,
      comment:
        "Two years in analytics with ownership of a weekly reporting cycle. The JD asks for someone who has shipped decisions off their own analysis; the CV shows analysis delivered to others who then decided.",
    },
    {
      key: "domainMatch",
      label: "Domain Match",
      score: 74,
      comment:
        "Consumer subscription experience transfers reasonably to this marketplace role, though marketplace-specific dynamics like supply liquidity and take-rate are absent from the CV.",
    },
    {
      key: "roleRelevance",
      label: "Role Relevance",
      score: 71,
      comment:
        "Titles have been analyst-shaped throughout, while this role is pitched at product analyst with roadmap input. The analytical core matches; the product-partnering half is unevidenced.",
    },
  ],
  strongPoints: [
    "Quantitative training that lines up with the role's core reasoning demands.",
    "Two years of applied SQL and Python work described with concrete outputs.",
    "A retention-modelling capstone that maps closely onto the role's first project.",
  ],
  weakPoints: [
    "No evidence of designing or running experiments, which the JD names first.",
    "Analysis is described as delivered to decision-makers rather than owned through to a decision.",
    "Marketplace dynamics — supply liquidity, take-rate, two-sided growth — are absent.",
  ],
};
