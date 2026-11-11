import Link from "next/link";
import { listCandidates, FUNNEL_STAGES, FUNNEL_STAGE_LABEL, type FunnelStage } from "@/lib/adminCandidates";
import { getBillingSummaries } from "@/lib/adminEntitlements";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge from "@/app/admin/_components/Badge";
import Pagination from "@/app/admin/_components/Pagination";
import PageHeader from "@/app/admin/_components/PageHeader";

const inputStyle = { fontSize: 13, padding: "8px 12px", border: "1px solid #dcdcdc", borderRadius: 7 } as const;

export default async function AdminCandidatesPage({ searchParams }: { searchParams: Promise<{ page?: string; stage?: string; q?: string }> }) {
  const { page: pageParam, stage: stageParam, q } = await searchParams;
  const stage = (FUNNEL_STAGES as readonly string[]).includes(stageParam ?? "") ? (stageParam as FunnelStage) : undefined;
  const { rows: candidates, page, totalPages, total } = await listCandidates(Number(pageParam) || 1, { stage, q });
  const billing = await getBillingSummaries(candidates.map((c) => c.userId).filter(Boolean));
  const query = new URLSearchParams({ ...(stage ? { stage } : {}), ...(q ? { q } : {}) }).toString();

  return (
    <div>
      <PageHeader title="Candidates" description={`${total} candidates, newest first. Open one to see and fix everything about them.`} />
      <form method="GET" action="/admin/candidates" className="flex items-center" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input name="q" defaultValue={q ?? ""} placeholder="Name or email" className="font-[family-name:var(--font-poppins)]" style={{ ...inputStyle, width: 240 }} />
        <select name="stage" defaultValue={stage ?? ""} className="font-[family-name:var(--font-poppins)]" style={inputStyle}>
          <option value="">Any stage</option>
          {FUNNEL_STAGES.map((s) => (
            <option key={s} value={s}>
              {FUNNEL_STAGE_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="font-[family-name:var(--font-poppins)] font-semibold"
          style={{ fontSize: 13, padding: "8px 14px", borderRadius: 7, border: "1px solid #dcdcdc", background: "transparent", color: "#4b4b4d", cursor: "pointer" }}
        >
          Filter
        </button>
        {(stage || q) && (
          <Link href="/admin/candidates" className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12 }}>
            Clear
          </Link>
        )}
      </form>
      <Table>
        <TableHeadRow columns={["Name", "Email", "Roles", "Paid", "Unused interviews", "Furthest step"]} />
        <tbody>
          {candidates.map((c) => {
            const b = billing.get(c.userId);
            return (
              <TableRow key={c.userId ?? c.email}>
                <TableCell>
                  {c.userId ? (
                    <Link href={`/admin/candidates/${c.userId}`} className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]">
                      {c.name || c.email}
                    </Link>
                  ) : (
                    <span className="font-[family-name:var(--font-poppins)] font-semibold text-black" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      {c.name || c.email}
                      <Badge variant="neutral">Not linked</Badge>
                    </span>
                  )}
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{b?.roles ?? 1}</TableCell>
                <TableCell>{b && b.paidPaise > 0 ? `₹${(b.paidPaise / 100).toLocaleString("en-IN")}` : "None"}</TableCell>
                <TableCell>{b && b.unusedInterviewCredits > 0 ? <Badge variant="warning">{b.unusedInterviewCredits}</Badge> : "None"}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{FUNNEL_STAGE_LABEL[c.funnelStage]}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
          {candidates.length === 0 && <TableEmptyRow colSpan={6} message={stage || q ? "No candidates match." : "No candidates yet."} />}
        </tbody>
      </Table>
      <Pagination page={page} totalPages={totalPages} basePath={query ? `/admin/candidates?${query}` : "/admin/candidates"} />
    </div>
  );
}
