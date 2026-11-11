import { listWebhookEvents } from "@/lib/intervueboxWebhookEvents";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Pagination from "@/app/admin/_components/Pagination";
import PageHeader from "@/app/admin/_components/PageHeader";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default async function AdminWebhookEventsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const { rows: events, page, totalPages } = await listWebhookEvents(Number(pageParam) || 1);

  return (
    <div>
      <PageHeader title="Interview vendor events" description="Messages from the interview vendor and the interview updates each one caused." />
      <Table minWidth={760}>
        <TableHeadRow columns={["When", "Interview updates", "Message"]} />
        <tbody>
          {events.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                {formatDateTime(e.createdAt)}
              </TableCell>
              <TableCell>
                {e.sweepError ? (
                  <span style={{ color: "#ed1a24" }}>{e.sweepError}</span>
                ) : e.sweepResult ? (
                  <span className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 12 }}>
                    ready {e.sweepResult.ready} · appeared {e.sweepResult.appeared} · terminated {e.sweepResult.terminated} · errors {e.sweepResult.errors}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <details>
                  <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
                    Show raw message
                  </summary>
                  <pre
                    className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]"
                    style={{ fontSize: 11, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 120, overflow: "auto", margin: "6px 0 0" }}
                  >
                    {typeof e.rawPayload === "string" ? e.rawPayload : JSON.stringify(e.rawPayload, null, 2)}
                  </pre>
                </details>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && <TableEmptyRow colSpan={3} message="No vendor messages yet." />}
        </tbody>
      </Table>
      <Pagination page={page} totalPages={totalPages} basePath="/admin/webhook-events" />
    </div>
  );
}
