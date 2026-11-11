import { requireAdmin } from "@/lib/adminAuth";
import { listAllowlist } from "@/lib/planAllowlist";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import AllowlistForm from "./AllowlistForm";
import RemoveButton from "./RemoveButton";
import PageHeader from "@/app/admin/_components/PageHeader";

export default async function PlanAllowlistPage() {
  await requireAdmin();
  const rows = await listAllowlist();
  return (
    <div>
      <PageHeader title="Plan allowlist" description="People on this list see the two plans instead of single prices. Removing someone keeps any plan they bought." />
      <AllowlistForm />
      <p className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 13, margin: "0 0 8px" }}>{rows.length} emails</p>
      <Table>
        <TableHeadRow columns={["Email", "Note", "Added by", "Added", ""]} />
        <tbody>
          {rows.map((r) => (
            <TableRow key={r.email}>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.note ?? "None"}</TableCell>
              <TableCell>{r.added_by}</TableCell>
              <TableCell>{new Date(r.added_at).toLocaleDateString("en-IN")}</TableCell>
              <TableCell align="right">
                <RemoveButton email={r.email} />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && <TableEmptyRow colSpan={5} message="No emails yet." />}
        </tbody>
      </Table>
    </div>
  );
}
