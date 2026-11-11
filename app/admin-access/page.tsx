import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseAuthServer";
import { getAdminEmails } from "@/lib/adminAuth";

// Lives outside app/admin so the admin layout's requireAdmin() doesn't loop back here.
export default async function AdminAccessPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/hub/login?next=/admin");
  if (user.email && getAdminEmails().includes(user.email.toLowerCase())) redirect("/admin");

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "#f9fafd" }}>
      <div className="bg-white border border-black/[0.08]" style={{ maxWidth: 440, width: "100%", borderRadius: 14, padding: 28 }}>
        <h1 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.3rem", margin: "0 0 8px" }}>
          Admin needs a different account
        </h1>
        <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 14, margin: "0 0 20px" }}>
          You are signed in as <strong className="text-black">{user.email}</strong>, which is not an admin account. Sign in with your admin email
          to open admin. This replaces the current sign-in in this browser.
        </p>
        <Link
          href="/hub/login?next=/admin"
          className="font-[family-name:var(--font-poppins)] font-semibold"
          style={{ display: "inline-block", fontSize: 14, padding: "10px 18px", borderRadius: 8, background: "#ed1a24", color: "#fff" }}
        >
          Sign in as admin
        </Link>
        <Link href="/hub/account" className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13, marginLeft: 16 }}>
          Back to my account
        </Link>
      </div>
    </main>
  );
}
