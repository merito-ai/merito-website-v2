import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase";
import { RECRUITER_PREVIEW_ENABLED } from "@/lib/featureFlags";
import RecruiterPreviewSettingsClient from "./RecruiterPreviewSettingsClient";

export default async function RecruiterPreviewSettingsPage() {
  if (!RECRUITER_PREVIEW_ENABLED) redirect("/hub/account");
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  const { data: settingsRow } = await supabase
    .from("recruiter_preview_settings")
    .select("enabled, sections, linkedin_url")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <RecruiterPreviewSettingsClient
      initialEnabled={settingsRow?.enabled ?? false}
      initialLinkedinUrl={settingsRow?.linkedin_url ?? null}
    />
  );
}
