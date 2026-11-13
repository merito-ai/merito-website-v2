import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getCvDownload, cvDownloadResponse } from "@/lib/cvDownload";

export const runtime = "nodejs";

// The signed-in candidate's own CV for one of their roles (?lead=<fitment_leads.id>).
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const leadId = new URL(request.url).searchParams.get("lead");
  if (!leadId) {
    return Response.json({ error: "Missing lead." }, { status: 400 });
  }

  return cvDownloadResponse(await getCvDownload(user.id, leadId));
}
