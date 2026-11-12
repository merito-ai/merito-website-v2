import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { nameFromEmail, type Scores, type Validity } from "@/lib/personality";
import type { CultureScores } from "@/lib/psychometrics/scoring";
import { isProductUnlocked } from "@/lib/productUnlocks";
import { DEFAULT_LEVEL, type CandidateLevel } from "@/lib/razorpay/pricing";
import PersonalityTestClient from "./PersonalityTestClient";
import PersonalityLockedState from "./PersonalityLockedState";
import PlanFeatureNote from "@/app/hub/account/PlanFeatureNote";

// Reads naturally in the test intro ("..., for your next role") and the report ("fit signal for your next role").
const NO_ROLE_TITLE = "your next role";

export default async function PersonalityTestPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  const { data: leads } = await supabase
    .from("fitment_leads")
    .select("id, role_title, candidate_level, name")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const current = leads?.[0];

  const { role, lead } = await searchParams;
  let roleTitle = typeof role === "string" ? role : null;

  // Note: ?lead= param is accepted for URL consistency but not used
  // (personality tests are candidate-wide)

  if (!roleTitle) {
    roleTitle = current?.role_title ?? null;
  }

  const [personalityUnlocked, referencesUnlocked] = await Promise.all([
    isProductUnlocked(user.id, "personality"),
    isProductUnlocked(user.id, "references"),
  ]);
  const bundleEligible = !personalityUnlocked && !referencesUnlocked;

  // Plan holders can take the test before checking any role (it is candidate-wide); the saved row needs a label.
  if (!current && personalityUnlocked) {
    roleTitle ??= NO_ROLE_TITLE;
  }
  if (!roleTitle) {
    redirect("/hub/account");
  }

  const level = (current?.candidate_level as CandidateLevel | null | undefined) ?? DEFAULT_LEVEL;

  if (!personalityUnlocked) {
    if (!current) redirect("/hub/account"); // locked and no role: nothing to buy against
    return (
      <main>
        <div className="mx-auto" style={{ maxWidth: 820, padding: "28px 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <h1 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
              Personality test
            </h1>
            <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 14, margin: 0 }}>
              Part of your profile: done once, applies to every application.
            </p>
          </div>
          <PersonalityLockedState leadId={current.id} roleTitle={roleTitle} level={level} bundleEligible={bundleEligible} />
        </div>
      </main>
    );
  }

  const { data: existing } = await supabase
    .from("personality_tests")
    .select("scores, validity, version, culture_scores, culture_reliable")
    .eq("user_id", user.id)
    .maybeSingle();

  const initialRow = existing ? { version: existing.version as number, culture_scores: existing.culture_scores } : null;
  const initialResult =
    existing && existing.scores && existing.validity
      ? {
          scores: existing.scores as Scores,
          validity: existing.validity as Validity,
          culture: existing.culture_scores
            ? { scores: existing.culture_scores as CultureScores, reliable: existing.culture_reliable as boolean | null }
            : null,
        }
      : null;

  // Real name from the fitment form; the email local-part is only a fallback.
  const candidateName = current?.name || nameFromEmail(user.email ?? "");

  return (
    <main>
      <div className="mx-auto" style={{ padding: "28px 24px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <h1 className="font-[family-name:var(--font-gabarito)] font-semibold text-white" style={{ fontSize: "1.6rem", margin: "0 0 6px" }}>
            Personality test
          </h1>
          <p className="font-[family-name:var(--font-poppins)] text-white/55" style={{ fontSize: 14, margin: 0 }}>
            Part of your profile: done once, applies to every application.
          </p>
          <PlanFeatureNote userId={user.id} feature="personality" />
        </div>
        <PersonalityTestClient
          roleTitle={roleTitle}
          candidateName={candidateName}
          initialRow={initialRow}
          initialResult={initialResult}
        />
      </div>
    </main>
  );
}
