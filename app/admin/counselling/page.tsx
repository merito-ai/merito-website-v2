import Link from "next/link";
import { listCounsellingRequests, type CounsellingStatus } from "@/lib/adminCounselling";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge, { type BadgeVariant } from "@/app/admin/_components/Badge";
import PageHeader from "@/app/admin/_components/PageHeader";

const STATUS_VARIANT: Record<CounsellingStatus, BadgeVariant> = {
  requested: "warning",
  scheduled: "neutral",
  completed: "success",
  cancelled: "danger",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminCounsellingPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const { all } = await searchParams;
  const includeAll = all === "1";
  const requests = await listCounsellingRequests(includeAll);

  return (
    <div>
      <PageHeader
        title="Counselling & Plans"
        description={includeAll ? "All counselling and mentoring requests." : "Requests waiting to be scheduled or held. Open one to update it."}
      >
        <Link
          href={includeAll ? "/admin/counselling" : "/admin/counselling?all=1"}
          className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]"
          style={{ fontSize: 13 }}
        >
          {includeAll ? "Show active only" : "Show all"}
        </Link>
      </PageHeader>

      <Table>
        <TableHeadRow columns={["Candidate", "Session", "Order", "Status", "Requested", "Scheduled"]} />
        <tbody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <Link href={`/admin/counselling/${r.id}`} className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]">
                  {r.email}
                </Link>
              </TableCell>
              <TableCell>{r.sessionLabel ?? "—"}</TableCell>
              <TableCell>{r.orderId}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </TableCell>
              <TableCell>{formatDate(r.requestedAt)}</TableCell>
              <TableCell>{formatDate(r.scheduledAt)}</TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableEmptyRow colSpan={6} message={includeAll ? "No counselling requests yet." : "Nothing to schedule."} />
          )}
        </tbody>
      </Table>
    </div>
  );
}
