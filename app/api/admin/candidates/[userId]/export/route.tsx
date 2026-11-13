import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAuditLog";
import { renderPageToPdf, requestCookiesFor } from "@/lib/pdf/renderPageToPdf";
import { safeFileName } from "@/lib/cvDownload";
import { getSupabaseServerClient } from "@/lib/supabase";
import { loadCombinedReportData } from "@/lib/combinedReportData";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ userId: string }> };

// Full combined report PDF for one candidate (?role=<role title>), including sections the candidate hasn't unlocked.
export async function GET(request: Request, { params }: RouteContext) {
  const admin = await requireAdmin();
  const { userId } = await params;
  const url = new URL(request.url);
  const role = url.searchParams.get("role");

  // The print page 404s with nothing to show; check first so we don't send a PDF of the 404 page.
  const data = await loadCombinedReportData({
    supabase: getSupabaseServerClient(),
    userId,
    userEmail: null,
    include: new Set(["fitment", "personality", "interview", "references"]),
    roleTitleParam: role,
    includeLocked: true,
  });
  if (!data.fitment && !data.personality && !data.interview && !data.references) {
    return Response.json({ error: "This candidate has no reports yet." }, { status: 404 });
  }

  const targetUrl = new URL(`/admin-print/candidates/${encodeURIComponent(userId)}`, url.origin);
  if (role) targetUrl.searchParams.set("role", role);

  let buffer: Buffer;
  try {
    buffer = await renderPageToPdf(targetUrl.toString(), requestCookiesFor(request, url.hostname), { singlePage: true });
  } catch (err) {
    console.error("Admin report PDF render failed", {
      userId,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return Response.json({ error: "Could not generate the PDF. Please try again." }, { status: 502 });
  }

  await logAdminAction({
    adminEmail: admin.email as string,
    action: "candidate.report_exported",
    targetType: "candidate",
    targetId: userId,
    newValue: { role },
  });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName(role ? `merito-report-${role}` : "merito-report", "merito-report")}.pdf"`,
    },
  });
}
