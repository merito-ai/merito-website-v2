import { listLearnedSkills } from "@/lib/adminLearnedSkills";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import PageHeader from "@/app/admin/_components/PageHeader";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminLearnedSkillsPage() {
  const skills = await listLearnedSkills();

  return (
    <div>
      <PageHeader title="Learned skills" description={`${skills.length} skills found in job descriptions that are not in the built-in skill list yet.`} />

      <Table>
        <TableHeadRow columns={["Skill", "Sample job", "First seen"]} />
        <tbody>
          {skills.map((s) => (
            <TableRow key={s.skill}>
              <TableCell>{s.skill}</TableCell>
              <TableCell>{s.sampleJobTitle ?? <span className="text-[#9c9c9c]">—</span>}</TableCell>
              <TableCell>{formatDate(s.firstSeenAt)}</TableCell>
            </TableRow>
          ))}
          {skills.length === 0 && <TableEmptyRow colSpan={3} message="No learned skills yet." />}
        </tbody>
      </Table>
    </div>
  );
}
