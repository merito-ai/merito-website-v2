import Link from "next/link";
import { requireAdmin } from "@/lib/adminAuth";
import { listAllowlist } from "@/lib/planAllowlist";
import { loadAllowlistProgress, summarizeProgress, type ProgressRow } from "@/lib/allowlistProgress";
import { PRODUCT_LABELS } from "@/lib/razorpay/pricing";
import { ASSISTANCE_LABEL } from "@/lib/planFeatures";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge, { type BadgeVariant } from "@/app/admin/_components/Badge";
import AllowlistForm from "./AllowlistForm";
import RemoveButton from "./RemoveButton";
import PageHeader from "@/app/admin/_components/PageHeader";

const inputStyle = { fontSize: 13, padding: "8px 12px", border: "1px solid #dcdcdc", borderRadius: 7 } as const;
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "-");
const muted = (text: string) => <span className="text-[#9c9c9c]">{text}</span>;

const REFERENCES: Record<ProgressRow["references"], [string, BadgeVariant]> = { none: ["No", "neutral"], waiting: ["Waiting", "warning"], done: ["Done", "success"] };
const INTERVIEW: Record<ProgressRow["interview"], [string, BadgeVariant]> = {
  none: ["No", "neutral"],
  invited: ["Invited", "warning"],
  started: ["Started", "warning"],
  done: ["Done", "success"],
  ended: ["Ended early", "danger"],
};

export default async function PlanAllowlistPage({ searchParams }: { searchParams: Promise<{ note?: string }> }) {
  await requireAdmin();
  const { note } = await searchParams;
  const all = await listAllowlist();
  const notes = [...new Set(all.map((r) => r.note).filter((n): n is string => Boolean(n)))].sort();
  const rows = await loadAllowlistProgress(note ? all.filter((r) => r.note === note) : all);
  const s = summarizeProgress(rows);
  return (
    <div>
      <PageHeader title="Plan allowlist" description="People on this list see the two plans instead of single prices. Removing someone keeps any plan they bought." />
      <AllowlistForm />
      <form method="GET" action="/admin/plan-allowlist" className="flex items-center" style={{ gap: 8, margin: "0 0 12px", flexWrap: "wrap" }}>
        <select name="note" defaultValue={note ?? ""} aria-label="Filter by note" className="font-[family-name:var(--font-poppins)]" style={inputStyle}>
          <option value="">All notes</option>
          {notes.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          type="submit"
          className="font-[family-name:var(--font-poppins)] font-semibold"
          style={{ fontSize: 13, padding: "8px 14px", borderRadius: 7, border: "1px solid #dcdcdc", background: "transparent", color: "#4b4b4d", cursor: "pointer" }}
        >
          Filter
        </button>
        {note && (
          <Link href="/admin/plan-allowlist" className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12 }}>
            Clear
          </Link>
        )}
      </form>
      <p className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 13, margin: "0 0 8px" }}>
        {s.invited} invited · {s.signedIn} signed in · {s.plan} bought a plan · {s.personality} personality done · {s.references} references done · {s.interview} interviews done
      </p>
      <Table minWidth={1400}>
        <TableHeadRow columns={["Email", "Note", "Signed up", "Last sign-in", "Roles", "Plan", "Personality", "References", "Interview", "Mentoring", "Assistance", "Added", ""]} />
        <tbody>
          {rows.map((r) => (
            <TableRow key={r.email}>
              <TableCell>
                {/* The candidate page needs at least one role check; before that there is nothing to open. */}
                {r.userId && r.roles > 0 ? (
                  <Link href={`/admin/candidates/${r.userId}`} className="font-semibold text-[#ed1a24]">{r.email}</Link>
                ) : (
                  r.email
                )}
              </TableCell>
              <TableCell>{r.note ?? ""}</TableCell>
              <TableCell>{r.signedUpAt ? day(r.signedUpAt) : muted("No")}</TableCell>
              <TableCell>{r.lastSignInAt ? day(r.lastSignInAt) : muted("-")}</TableCell>
              <TableCell>{r.userId ? r.roles : muted("-")}</TableCell>
              <TableCell>{r.plan ? <>{PRODUCT_LABELS[r.plan.product]}<br />{muted(day(r.plan.since))}</> : muted("-")}</TableCell>
              <TableCell>{r.personalityDone ? <Badge variant="success">Done</Badge> : muted("No")}</TableCell>
              <TableCell>
                <Badge variant={REFERENCES[r.references][1]}>{REFERENCES[r.references][0]}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={INTERVIEW[r.interview][1]}>{INTERVIEW[r.interview][0]}</Badge>
              </TableCell>
              <TableCell>{r.mentoring ? <>1: {r.mentoring[0]}<br />2: {r.mentoring[1]}</> : muted("-")}</TableCell>
              <TableCell>{r.assistance ? ASSISTANCE_LABEL[r.assistance] : muted("-")}</TableCell>
              <TableCell>{day(r.added_at)}<br />{muted(r.added_by)}</TableCell>
              <TableCell align="right">
                <RemoveButton email={r.email} />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && <TableEmptyRow colSpan={13} message={note ? "No emails with this note." : "No emails yet."} />}
        </tbody>
      </Table>
    </div>
  );
}
