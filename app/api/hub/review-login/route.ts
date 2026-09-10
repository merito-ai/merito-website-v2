import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

// TEMPORARY — passwordless one-click login for a single sandbox account so the
// Razorpay activation reviewer can reach the checkout paywalls without an inbox
// round-trip. Gated to exactly REVIEW_LOGIN_EMAIL; unset that env var and the
// route 404s. Remove this file after activation clears.
export async function GET(request: Request) {
  const allowed = process.env.REVIEW_LOGIN_EMAIL?.trim().toLowerCase();
  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!allowed || !email || email !== allowed) {
    return new Response("Not found", { status: 404 });
  }

  const admin = getSupabaseServerClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data.properties?.hashed_token) {
    console.error("review-login: generateLink failed", { error });
    return Response.redirect(`${origin}/hub/login?error=expired`, 307);
  }

  // verifyOtp on the cookie-aware client is what actually writes the session
  // cookies (same mechanism as /hub/auth/callback).
  const supabase = await createSupabaseServerClient();
  const { data: verified, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: data.properties.hashed_token,
    type: "magiclink",
  });
  if (verifyError || !verified.user) {
    console.error("review-login: verifyOtp failed", { verifyError });
    return Response.redirect(`${origin}/hub/login?error=expired`, 307);
  }

  return Response.redirect(`${origin}/hub/account`, 307);
}
