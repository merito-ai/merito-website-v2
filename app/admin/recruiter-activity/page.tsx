import Link from "next/link";
import { listRecruiterActions } from "@/lib/recruiterActionLog";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Pagination from "@/app/admin/_components/Pagination";
import PageHeader from "@/app/admin/_components/PageHeader";
import { formatActionLabel, formatTarget, formatValue } from "@/lib/adminLabels";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminRecruiterActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const { rows: actions, page, totalPages } = await listRecruiterActions(Number(pageParam) || 1);

  return (
    <div>
      <PageHeader title="Recruiter activity" description="What signed-in recruiters did. Contact reveals are on their own page." />
      <Table minWidth={760}>
        <TableHeadRow columns={["When", "Recruiter", "Action", "Target", "Detail"]} />
        <tbody>
          {actions.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{formatDateTime(a.createdAt)}</TableCell>
              <TableCell>{a.recruiterEmail}</TableCell>
              <TableCell>{formatActionLabel(a.action)}</TableCell>
              <TableCell>
                {a.targetType === "candidate" ? (
                  <Link href={`/admin/candidates/${a.targetId}`} className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]">
                    {formatTarget(a.targetType, a.targetId)}
                  </Link>
                ) : (
                  formatTarget(a.targetType, a.targetId)
                )}
              </TableCell>
              <TableCell>
                <span className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 12, wordBreak: "break-word" }}>
                  {formatValue(a.detail)}
                </span>
              </TableCell>
            </TableRow>
          ))}
          {actions.length === 0 && <TableEmptyRow colSpan={5} message="No recruiter activity yet." />}
        </tbody>
      </Table>
      <Pagination page={page} totalPages={totalPages} basePath="/admin/recruiter-activity" />
    </div>
  );
}
