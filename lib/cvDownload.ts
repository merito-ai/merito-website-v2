import { getSupabaseServerClient } from "@/lib/supabase";

export const CV_BUCKET = "candidate-cvs";

/** Filename safe for a storage key and a Content-Disposition header: no quotes, slashes or newlines. */
export function safeFileName(name: string, fallback = "CV"): string {
  const cleaned = name
    .replace(/[^A-Za-z0-9._ -]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/^[ .]+|[ .]+$/g, "")
    .slice(0, 100);
  return cleaned || fallback;
}

export type CvDownload = { kind: "url"; url: string } | { kind: "text"; text: string; filename: string };

/**
 * The CV for one of `userId`'s leads: a 60s signed URL to the stored original file, else the
 * extracted CV text (leads from before CVs were stored), else null. Returns null for a lead
 * that doesn't belong to `userId`, so callers can't reach another candidate's CV.
 */
export async function getCvDownload(userId: string, leadId: string): Promise<CvDownload | null> {
  const supabase = getSupabaseServerClient();
  const { data: lead } = await supabase
    .from("fitment_leads")
    .select("name, cv_path, cv_filename, resume_text")
    .eq("id", leadId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!lead) return null;

  if (lead.cv_path) {
    const { data, error } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(lead.cv_path, 60, { download: safeFileName(lead.cv_filename ?? "", "CV") });
    if (!error && data?.signedUrl) return { kind: "url", url: data.signedUrl };
    console.error("CV signed URL failed, falling back to text", { leadId, error: error?.message });
  }

  if (lead.resume_text) {
    return { kind: "text", text: lead.resume_text, filename: `${safeFileName(lead.name ?? "", "candidate")}-CV.txt` };
  }
  return null;
}

/** The route response for a getCvDownload result. */
export function cvDownloadResponse(cv: CvDownload | null): Response {
  if (!cv) return Response.json({ error: "No CV on file for this role." }, { status: 404 });
  if (cv.kind === "url") return Response.redirect(cv.url, 302);
  return new Response(cv.text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${cv.filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
