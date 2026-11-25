import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { getCounsellingRequest, updateCounsellingStatus, nextCounsellingState, istLocalToIso, type CounsellingStatus, type StatePatch } from "@/lib/adminCounselling";
import { logAdminAction } from "@/lib/adminAuditLog";

const STATUSES = ["requested", "scheduled", "completed", "cancelled"] as const;

const PatchSchema = z.object({
  status: z.enum(STATUSES),
  notes: z.string().optional(),
  // Optional call date and time (Calendly normally fills it) from the admin's datetime-local input, read as IST.
  session_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();

  const { id } = await params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "status must be one of requested, scheduled, completed, cancelled; session_at must be YYYY-MM-DDTHH:mm." }, { status: 400 });
  }

  const current = await getCounsellingRequest(id);
  if (!current) {
    return Response.json({ error: "Counselling request not found." }, { status: 404 });
  }

  const next = parsed.data.status as CounsellingStatus;
  const sessionAt = parsed.data.session_at ? istLocalToIso(parsed.data.session_at) : undefined;
  let patch: StatePatch;
  if (current.status === "scheduled" && next === "scheduled") {
    // Reschedule: same status, new call time.
    if (!sessionAt) return Response.json({ error: "Choose a new call date and time." }, { status: 400 });
    patch = { status: next, session_at: sessionAt };
  } else {
    try {
      patch = nextCounsellingState(current.status, next, new Date().toISOString());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid transition.";
      return Response.json({ error: message }, { status: 400 });
    }
    if (next === "scheduled" && sessionAt) patch.session_at = sessionAt;
  }

  await updateCounsellingStatus(id, patch, parsed.data.notes);

  try {
    await logAdminAction({
      adminEmail: admin.email as string,
      action: "counselling.status_change",
      targetType: "counselling_request",
      targetId: id,
      priorValue: { status: current.status, session_at: current.sessionAt },
      newValue: { status: parsed.data.status, notes: parsed.data.notes ?? null, session_at: patch.session_at ?? null },
    });
  } catch (error) {
    console.error("Failed to log admin action counselling.status_change", { id, error });
  }

  return Response.json({ ok: true });
}
