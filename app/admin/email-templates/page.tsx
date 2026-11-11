import Link from "next/link";
import { listTemplates } from "@/lib/emailTemplates";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import PageHeader from "@/app/admin/_components/PageHeader";

export default async function AdminEmailTemplatesPage() {
  const templates = await listTemplates();

  return (
    <div>
    <PageHeader title="Email templates" description="Text of the emails the system sends. Open one to edit it." />
    <Table>
      <TableHeadRow columns={["Key", "Subject", "Updated", "By"]} />
      <tbody>
        {templates.map((t) => (
          <TableRow key={t.key}>
            <TableCell>
              <Link href={`/admin/email-templates/${t.key}`} className="text-[#ed1a24]">
                {t.key}
              </Link>
            </TableCell>
            <TableCell>{t.subject}</TableCell>
            <TableCell>{new Date(t.updatedAt).toLocaleString("en-IN", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</TableCell>
            <TableCell>{t.updatedBy ?? "—"}</TableCell>
          </TableRow>
        ))}
        {templates.length === 0 && <TableEmptyRow colSpan={4} message="No templates found." />}
      </tbody>
    </Table>
    </div>
  );
}
