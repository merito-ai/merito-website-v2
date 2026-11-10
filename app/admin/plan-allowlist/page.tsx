import { requireAdmin } from "@/lib/adminAuth";
import { listAllowlist } from "@/lib/planAllowlist";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import AllowlistForm from "./AllowlistForm";
import RemoveButton from "./RemoveButton";

export default async function PlanAllowlistPage() {
  await requireAdmin();
  const rows = await listAllowlist();
  return (
    <div>
      <p className="font-[family-name:var(--font-poppins)] text-[#6b6b6b]" style={{ fontSize: 13, margin: "0 0 16px" }}>
        Signed-in users with these emails see the two plans instead of individual prices. Removing an email does not take away a plan already bought.
      </p>
      <AllowlistForm />
      <p className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 13, margin: "0 0 8px" }}>{rows.length} emails</p>
      <Table>
        <TableHeadRow columns={["Email", "Note", "Added by", "Added", ""]} />
        <tbody>
          {rows.map((r) => (
            <TableRow key={r.email}>
              <TableCell>{r.email}</TableCell>
              <TableCell>{r.note ?? "—"}</TableCell>
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
