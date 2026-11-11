import { requireAdmin } from "@/lib/adminAuth";
import { searchCandidates } from "@/lib/adminCandidates";

// Backs the merge picker on the candidate page.
export async function GET(request: Request) {
  await requireAdmin();
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const rows = await searchCandidates(q);
  return Response.json({ results: rows.map((c) => ({ userId: c.userId, email: c.email, name: c.name, roleTitle: c.latestRoleTitle })) });
}
