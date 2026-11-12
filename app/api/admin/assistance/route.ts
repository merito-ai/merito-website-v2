import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { setAssistance, ASSISTANCE_STATUSES } from "@/lib/planAssistance";

const PatchSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(ASSISTANCE_STATUSES),
  companies: z.string().max(2000).optional(),
});

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "userId and a valid status are required." }, { status: 400 });
  }
  const companies = parsed.data.companies?.trim() || null;
  try {
    await setAssistance(parsed.data.userId, parsed.data.status, companies, admin.email as string);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Failed to save." }, { status: 409 });
  }
  return Response.json({ ok: true });
}
