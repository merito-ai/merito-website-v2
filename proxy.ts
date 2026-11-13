import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { RECRUITER_PREVIEW_ENABLED } from "@/lib/featureFlags";
import { safeNextPath } from "@/lib/safeNext";

export async function proxy(request: NextRequest) {
  // Recruiter preview is parked (extension risks LinkedIn bans): its APIs,
  // including the ones the extension calls, 404 until the flag is on.
  if (request.nextUrl.pathname.includes("/recruiter-preview")) {
    if (!RECRUITER_PREVIEW_ENABLED) return new NextResponse(null, { status: 404 });
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Not configured in this environment — let the request through rather
    // than hard-failing every page load; the protected pages themselves
    // will still fail closed if they try to read a real session.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL("/hub/login", request.url);
    // Deep links come back after sign-in; the callback re-checks next with the same guard.
    const next = safeNextPath(request.nextUrl.pathname + request.nextUrl.search);
    if (next && next !== "/hub/account") login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  // :path* also covers /hub/account itself; server components can't save a refreshed session cookie, so the proxy must.
  matcher: ["/hub/account/:path*", "/api/hub/recruiter-preview/:path*", "/api/public/recruiter-preview/:path*"],
};
