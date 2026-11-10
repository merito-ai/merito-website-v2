import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getPlanState } from "@/lib/plans";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  return Response.json(await getPlanState(user.id, user.email));
}
