import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getPlanState } from "@/lib/plans";
import { countUnusedInterviewCredits } from "@/lib/interviewCredits";

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
  return Response.json({ ...state, interviewCredits });
}
