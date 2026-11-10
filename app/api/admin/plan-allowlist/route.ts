import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { enforceAdminRateLimit, RateLimitExceededError } from "@/lib/adminRateLimit";
import { parseEmailList, addToAllowlist, removeFromAllowlist } from "@/lib/planAllowlist";

const PostSchema = z.object({ emails: z.string().min(1), note: z.string().max(200).optional() });
const DeleteSchema = z.object({ email: z.string().email() });

async function readJson(request: Request): Promise<unknown> {
  try { return await request.json(); } catch { return null; }
}

function errorResponse(error: unknown) {
  if (error instanceof RateLimitExceededError) return Response.json({ error: error.message }, { status: 429 });
  return Response.json({ error: error instanceof Error ? error.message : "Failed." }, { status: 500 });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const parsed = PostSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "Paste at least one email." }, { status: 400 });
  const { valid, invalid } = parseEmailList(parsed.data.emails);
  if (valid.length === 0) return Response.json({ error: "No valid emails found.", invalid }, { status: 400 });
  try {
    await enforceAdminRateLimit(admin.email as string, "plan_allowlist.add");
    const added = await addToAllowlist(valid, parsed.data.note?.trim() || null, admin.email as string);
    return Response.json({ added, invalid });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  const parsed = DeleteSchema.safeParse(await readJson(request));
  if (!parsed.success) return Response.json({ error: "A valid email is required." }, { status: 400 });
  try {
    await enforceAdminRateLimit(admin.email as string, "plan_allowlist.remove");
    await removeFromAllowlist(parsed.data.email, admin.email as string);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
