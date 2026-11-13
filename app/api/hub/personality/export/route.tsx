import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { renderPageToPdf, requestCookiesFor } from "@/lib/pdf/renderPageToPdf";
import { isPersonalityComplete } from "@/lib/psychometrics/testFlow";
import { NO_ROLE_TITLE } from "@/lib/psychometrics/reportCopy";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const roleTitle =
    url.searchParams.get("role") ||
    (
      await supabase
        .from("fitment_leads")
        .select("role_title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data?.role_title ||
    NO_ROLE_TITLE;

  const { data: existing } = await supabase
    .from("personality_tests")
    .select("scores, validity, version, culture_scores")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing || !existing.scores || !existing.validity || !isPersonalityComplete(existing)) {
    return Response.json({ error: "Personality test not completed yet." }, { status: 404 });
  }

  const pageCookies = requestCookiesFor(request, url.hostname);

  const buffer = await renderPageToPdf(
    `${url.origin}/hub/account/personality/print?role=${encodeURIComponent(roleTitle)}`,
    pageCookies,
    { singlePage: true }
  );

  // ?inline=1 is used by ExportPreviewModal's <iframe> -- an "attachment"
  // disposition forces a download prompt instead of rendering in the iframe.
  const disposition = url.searchParams.get("inline") === "1" ? "inline" : "attachment";

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="personality-report.pdf"`,
    },
  });
}
