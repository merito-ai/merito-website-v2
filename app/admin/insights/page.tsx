import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase";
import { parseInternalList } from "@/lib/adminInternal";
import { formatKey } from "@/lib/adminLabels";
import PageHeader from "@/app/admin/_components/PageHeader";
import { Table, TableHeadRow, TableRow, TableCell } from "@/app/admin/_components/Table";
import { FUNNEL_STAGES, FUNNEL_STAGE_LABEL } from "@/lib/adminCandidates";
import {
  getFunnelDropoff,
  getRoleTitleBreakdown,
  getRevenueBreakdown,
  getDataQualityStats,
  getWeeklyTrends,
  getRecruiterEngagementFunnel,
  getScoreAnalysis,
} from "@/lib/adminAnalytics";
import TrendBarChart from "@/app/admin/_components/TrendBarChart";
import HistogramBars from "@/app/admin/_components/HistogramBars";

const REFERENCE_STATUSES = ["initiated", "in_progress", "completed", "cancelled"] as const;

async function getRawFunnelCounts() {
  const supabase = getSupabaseServerClient();

  const [{ count: interviewsStarted }, { count: interviewsTerminated }, { count: interviewsStuck }, { data: referenceRows }] =
    await Promise.all([
      supabase.from("fitment_interviews").select("*", { count: "exact", head: true }).eq("status", "invited"),
      supabase.from("fitment_interviews").select("*", { count: "exact", head: true }).eq("status", "terminated"),
      supabase.from("fitment_interviews").select("*", { count: "exact", head: true }).not("stuck_at", "is", null),
      supabase.from("reference_checks").select("status"),
    ]);

  const referenceCounts: Record<string, number> = Object.fromEntries(REFERENCE_STATUSES.map((s) => [s, 0]));
  for (const row of referenceRows ?? []) {
    if (row.status in referenceCounts) referenceCounts[row.status] += 1;
  }

  return { interviewsStarted: interviewsStarted ?? 0, interviewsTerminated: interviewsTerminated ?? 0, interviewsStuck: interviewsStuck ?? 0, referenceCounts };
}

function formatAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
}

function formatPct(n: number | null): string {
  return n === null ? "—" : `${n}%`;
}

const sectionHeading: React.CSSProperties = { fontSize: "1.1rem", margin: "0 0 14px" };

export default async function AdminInsightsPage({ searchParams }: { searchParams: Promise<{ internal?: string }> }) {
  const { internal } = await searchParams;
  const includeInternal = internal === "1";
  const [dropoff, rawCounts, roleBreakdown, revenue, dataQuality, weeklyTrends, recruiterFunnel, scoreAnalysis] = await Promise.all([
    getFunnelDropoff(includeInternal),
    getRawFunnelCounts(),
    getRoleTitleBreakdown(includeInternal),
    getRevenueBreakdown(includeInternal),
    getDataQualityStats(),
    getWeeklyTrends(12, includeInternal),
    getRecruiterEngagementFunnel(),
    getScoreAnalysis(includeInternal),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <PageHeader title="Insights" description="Is the business growing? Funnel, trends, revenue and scores. Check weekly.">
        {parseInternalList().length > 0 && (
          <Link
            href={includeInternal ? "/admin/insights" : "/admin/insights?internal=1"}
            className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]"
            style={{ fontSize: 12, whiteSpace: "nowrap" }}
          >
            {includeInternal ? "Hide team accounts" : "Show team accounts"}
          </Link>
        )}
      </PageHeader>
      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          Funnel
        </h3>
        <Table>
          <TableHeadRow columns={["Stage", "Reached", "% of started", "% of previous stage"]} />
          <tbody>
            {dropoff.map((row) => (
              <TableRow key={row.stage}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="right">
                  <strong className="text-black">{row.count}</strong>
                </TableCell>
                <TableCell align="right">{formatPct(row.pctOfStart)}</TableCell>
                <TableCell align="right">{formatPct(row.pctOfPrevious)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          Trends (last {weeklyTrends.length} weeks)
        </h3>
        <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 32 }}>
            <TrendBarChart
              title="New candidates / week"
              color="#ed1a24"
              data={weeklyTrends.map((w) => ({ weekStart: w.weekStart, value: w.newCandidates }))}
              formatValue={(n) => String(n)}
            />
            <TrendBarChart
              title="Revenue / week"
              color="#ed1a24"
              data={weeklyTrends.map((w) => ({ weekStart: w.weekStart, value: w.revenuePaise }))}
              formatValue={formatAmount}
            />
          </div>
        </div>
        <details>
          <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
            Table view
          </summary>
          <div style={{ marginTop: 8 }}>
            <Table>
              <TableHeadRow columns={["Week of", "New candidates", "Revenue"]} />
              <tbody>
                {weeklyTrends.map((w) => (
                  <TableRow key={w.weekStart}>
                    <TableCell>{w.weekStart}</TableCell>
                    <TableCell align="right">{w.newCandidates}</TableCell>
                    <TableCell align="right">{formatAmount(w.revenuePaise)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </details>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          Interviews and references
        </h3>
        <Table>
          <tbody>
            <TableRow>
              <TableCell>Interview invited, not finished</TableCell>
              <TableCell align="right">
                <strong className="text-black">{rawCounts.interviewsStarted}</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Interview terminated</TableCell>
              <TableCell align="right">
                <strong className="text-black">{rawCounts.interviewsTerminated}</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Interview stuck</TableCell>
              <TableCell align="right">
                <strong className="text-black">{rawCounts.interviewsStuck}</strong>
              </TableCell>
            </TableRow>
            {REFERENCE_STATUSES.map((s) => (
              <TableRow key={s}>
                <TableCell>References {s.replace("_", " ")}</TableCell>
                <TableCell align="right">
                  <strong className="text-black">{rawCounts.referenceCounts[s]}</strong>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          Recruiter engagement
        </h3>
        <Table>
          <tbody>
            <TableRow>
              <TableCell>Candidate lookups from the extension</TableCell>
              <TableCell align="right">
                <strong className="text-black">{recruiterFunnel.totalLookups}</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Matched to a Merito candidate</TableCell>
              <TableCell align="right">
                <strong className="text-black">{recruiterFunnel.matchedCandidates}</strong>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Of those, profile shared with recruiters</TableCell>
              <TableCell align="right">{recruiterFunnel.previewEnabledOfMatched}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Of those, had contact details revealed</TableCell>
              <TableCell align="right">{recruiterFunnel.contactRevealedOfMatched}</TableCell>
            </TableRow>
          </tbody>
        </Table>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          By role title
        </h3>
        <Table minWidth={760}>
          <TableHeadRow columns={["Role", "Total", ...FUNNEL_STAGES.map((s) => FUNNEL_STAGE_LABEL[s])]} />
          <tbody>
            {roleBreakdown.map((row) => (
              <TableRow key={row.roleTitle}>
                <TableCell>{row.roleTitle}</TableCell>
                <TableCell align="right">
                  <strong className="text-black">{row.total}</strong>
                </TableCell>
                {FUNNEL_STAGES.map((s) => (
                  <TableCell key={s} align="right">
                    {row[s]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </tbody>
        </Table>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          Revenue
        </h3>
        <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
          <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 12, padding: "14px 18px" }}>
            <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 11, margin: "0 0 4px" }}>
              All-time
            </p>
            <p className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.3rem", margin: 0 }}>
              {formatAmount(revenue.totalPaise)}
            </p>
          </div>
          <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 12, padding: "14px 18px" }}>
            <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 11, margin: "0 0 4px" }}>
              This month
            </p>
            <p className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.3rem", margin: 0 }}>
              {formatAmount(revenue.totalThisMonthPaise)}
            </p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20 }}>
          <div>
            <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 11, margin: "0 0 8px" }}>
              By product
            </p>
            <Table>
              <tbody>
                {revenue.byProduct.map((r) => (
                  <TableRow key={r.product}>
                    <TableCell>
                      {formatKey(r.product)} <span className="text-[#9c9c9c]">×{r.count}</span>
                    </TableCell>
                    <TableCell align="right">{formatAmount(r.amountPaise)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
          <div>
            <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 11, margin: "0 0 8px" }}>
              By role
            </p>
            <Table>
              <tbody>
                {revenue.byRoleTitle.map((r) => (
                  <TableRow key={r.roleTitle}>
                    <TableCell>
                      {r.roleTitle} <span className="text-[#9c9c9c]">×{r.count}</span>
                    </TableCell>
                    <TableCell align="right">{formatAmount(r.amountPaise)}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <details>
        <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
          Report data checks
        </summary>
        <div style={{ marginTop: 8 }}>
        <Table>
          <tbody>
            <TableRow>
              <TableCell>Finished interview reports with no per-skill scores</TableCell>
              <TableCell align="right">
                {dataQuality.interviewsMissingSkillReport} / {dataQuality.interviewsReady}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Finished fitment reports with no resume text</TableCell>
              <TableCell align="right">
                {dataQuality.fitmentMissingResumeText} / {dataQuality.fitmentReady}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Finished fitment reports with no category scores</TableCell>
              <TableCell align="right">
                {dataQuality.fitmentMissingCategories} / {dataQuality.fitmentReady}
              </TableCell>
            </TableRow>
          </tbody>
        </Table>
        </div>
      </details>

      <div>
        <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
          Scores
        </h3>
        <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 32, marginBottom: 20 }}>
            <HistogramBars title="Fitment score distribution (0-100)" buckets={scoreAnalysis.fitmentDistribution} color="#ed1a24" />
            <HistogramBars title="Interview score distribution (0-100)" buckets={scoreAnalysis.interviewDistribution} color="#ed1a24" />
          </div>
          <details>
          <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
            Do fitment and interview scores agree?
          </summary>
          <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 11, margin: "6px 0 0" }}>
            Fitment-vs-interview score correlation:{" "}
            <strong className="text-black">
              {scoreAnalysis.correlation === null
                ? "not enough paired data yet"
                : `r = ${scoreAnalysis.correlation.toFixed(2)} (${
                    Math.abs(scoreAnalysis.correlation) >= 0.6 ? "strong" : Math.abs(scoreAnalysis.correlation) >= 0.3 ? "moderate" : "weak"
                  })`}
            </strong>{" "}
            · {scoreAnalysis.correlationSampleSize} candidates with both reports for the same role. Admin-edited scores are left out.
          </p>
          </details>
        </div>
      </div>
    </div>
  );
}
