import { getLookupStats, listRecentLookups } from "@/lib/adminExtension";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge from "@/app/admin/_components/Badge";
import PageHeader from "@/app/admin/_components/PageHeader";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminExtensionPage() {
  const [stats, lookups] = await Promise.all([getLookupStats(), listRecentLookups()]);

  return (
    <div>
      <PageHeader
        title="Extension lookups"
        description={`Recruiters looking up candidates with the browser extension: ${stats.totalLookups} total, ${stats.matchedLookups} matched, ${stats.last30DaysLookups} in the last 30 days.`}
      />

      <Table>
        <TableHeadRow columns={["Candidate", "Date"]} />
        <tbody>
          {lookups.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.email ?? <Badge variant="neutral">No match</Badge>}</TableCell>
              <TableCell>{formatDate(l.createdAt)}</TableCell>
            </TableRow>
          ))}
          {lookups.length === 0 && <TableEmptyRow colSpan={2} message="No lookups yet." />}
        </tbody>
      </Table>
    </div>
  );
}
