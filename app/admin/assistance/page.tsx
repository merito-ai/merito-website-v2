import { requireAdmin } from "@/lib/adminAuth";
import { listAssistance, type AssistanceStatus } from "@/lib/planAssistance";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge, { type BadgeVariant } from "@/app/admin/_components/Badge";
import PageHeader from "@/app/admin/_components/PageHeader";
import AssistanceForm from "./AssistanceForm";
import { ASSISTANCE_LABEL } from "@/lib/planFeatures";

const VARIANT: Record<AssistanceStatus, BadgeVariant> = { not_contacted: "warning", in_progress: "neutral", done: "success" };

export default async function AdminAssistancePage() {
  await requireAdmin();
  const rows = await listAssistance();
  return (
    <div>
      <PageHeader
        title="Application assistance"
        description="Plan 2 holders. Call or email each within 7 working days of purchase to pick their 3 companies. The candidate sees In progress and Done on their dashboard."
      />
      <Table>
        <TableHeadRow columns={["Candidate", "Plan 2 since", "Status", "Update"]} />
        <tbody>
          {rows.map((r) => (
            <TableRow key={r.userId}>
              <TableCell>{r.email}</TableCell>
              <TableCell>{new Date(r.planSince).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</TableCell>
              <TableCell>
                <Badge variant={VARIANT[r.status]}>{ASSISTANCE_LABEL[r.status]}</Badge>
              </TableCell>
              <TableCell>
                <AssistanceForm userId={r.userId} email={r.email} status={r.status} companies={r.companies} />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && <TableEmptyRow colSpan={4} message="No Plan 2 holders yet." />}
        </tbody>
      </Table>
    </div>
  );
}
