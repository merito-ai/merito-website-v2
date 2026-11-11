import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getPlanState } from "@/lib/plans";
import { countUnusedInterviewCredits } from "@/lib/interviewCredits";
import { isProductUnlocked } from "@/lib/productUnlocks";
import { countReportUnlocks } from "@/lib/reportUnlocks";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const [state, interviewCredits] = await Promise.all([getPlanState(user.id, user.email), countUnusedInterviewCredits(user.id)]);
  // Only non-holders can buy a plan, so only they need the "you already have" note in the plan confirm dialog.
  const ownedIndividually = state.plan
    ? null
    : await Promise.all([isProductUnlocked(user.id, "personality"), isProductUnlocked(user.id, "references"), countReportUnlocks(user.id)]).then(
        ([personality, references, reportUnlocks]) => ({ personality, references, reportUnlocks, interviewCredits }),
      );
  return Response.json({ ...state, interviewCredits, ownedIndividually });
}
