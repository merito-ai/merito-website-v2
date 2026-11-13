import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAuditLog";
import { getCvDownload, cvDownloadResponse } from "@/lib/cvDownload";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ userId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();
  const { userId } = await params;
  const leadId = new URL(request.url).searchParams.get("lead");
  if (!leadId) {
    return Response.json({ error: "Missing lead." }, { status: 400 });
  }

  const cv = await getCvDownload(userId, leadId);
  if (cv) {
    await logAdminAction({
      adminEmail: admin.email as string,
      action: "candidate.cv_downloaded",
      targetType: "candidate",
      targetId: userId,
      newValue: { leadId, kind: cv.kind },
    });
  }
  return cvDownloadResponse(cv);
}
