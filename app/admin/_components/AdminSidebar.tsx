"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseAuth";
import Button from "@/app/admin/_components/Button";
import type { RecentCandidateView } from "@/lib/adminRecentViews";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/admin" },
  { label: "Candidates", href: "/admin/candidates" },
  { label: "Recruiters", href: "/admin/recruiters" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Counselling & Plans", href: "/admin/counselling" },
];

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Tools",
    items: [
      { label: "Broadcast", href: "/admin/notifications/broadcast" },
      { label: "Email templates", href: "/admin/email-templates" },
      { label: "Duplicates", href: "/admin/duplicates" },
      { label: "Plan allowlist", href: "/admin/plan-allowlist" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Pipeline failures", href: "/admin/pipeline-failures" },
      { label: "Webhook events", href: "/admin/webhook-events" },
      { label: "Learned skills", href: "/admin/learned-skills" },
      { label: "Recruiter activity", href: "/admin/recruiter-activity" },
      { label: "Contact reveals", href: "/admin/contact-requests" },
      { label: "Extension", href: "/admin/extension" },
      { label: "Admin log", href: "/admin/activity" },
    ],
  },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active, small = false }: { item: NavItem; active: boolean; small?: boolean }) {
  return (
    <Link
      href={item.href}
      className="font-[family-name:var(--font-poppins)] font-semibold"
      style={{
        fontSize: small ? 13 : 14,
        padding: small ? "7px 12px" : "10px 12px",
        borderRadius: 8,
        color: active ? "#fff" : "rgba(255,255,255,0.6)",
        background: active ? "#ed1a24" : "transparent",
      }}
    >
      {item.label}
    </Link>
  );
}

export default function AdminSidebar({ adminEmail, recentViews }: { adminEmail: string; recentViews: RecentCandidateView[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/hub/login");
  }

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px",
      }}
    >
      <p className="font-[family-name:var(--font-gabarito)] font-semibold" style={{ fontSize: "1.2rem", margin: "0 0 32px" }}>
        Merito Admin
      </p>

      <form
        action="/admin/search"
        method="GET"
        style={{ marginBottom: 20 }}
      >
        <input
          type="text"
          name="q"
          placeholder="Search name or email…"
          className="font-[family-name:var(--font-poppins)]"
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontSize: 13,
            padding: "8px 12px",
            borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
          }}
        />
      </form>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} active={isNavItemActive(pathname ?? "", item.href)} />
        ))}
        {NAV_GROUPS.map((group) => {
          const groupActive = group.items.some((item) => isNavItemActive(pathname ?? "", item.href));
          return (
            <details key={group.label} open={groupActive} style={{ marginTop: 8 }}>
              <summary
                className="font-[family-name:var(--font-poppins)] font-semibold"
                style={{ fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", padding: "8px 12px", cursor: "pointer" }}
              >
                {group.label}
              </summary>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} active={isNavItemActive(pathname ?? "", item.href)} small />
                ))}
              </div>
            </details>
          );
        })}
      </nav>

      {recentViews.length > 0 && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16, marginTop: 16 }}>
          <p
            className="font-[family-name:var(--font-poppins)] font-semibold"
            style={{ fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}
          >
            Recently viewed
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {recentViews.map((view) => (
              <Link
                key={view.userId}
                href={`/admin/candidates/${view.userId}`}
                className="font-[family-name:var(--font-poppins)]"
                style={{
                  fontSize: 12.5,
                  padding: "6px 12px",
                  borderRadius: 6,
                  color: "rgba(255,255,255,0.7)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {view.name || view.email}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16, marginTop: 16 }}>
        <p
          className="font-[family-name:var(--font-poppins)]"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 10px", wordBreak: "break-all" }}
        >
          {adminEmail}
        </p>
        <Button variant="danger" onClick={handleSignOut} loading={signingOut} style={{ width: "100%" }}>
          Sign out
        </Button>
      </div>
    </aside>
  );
}
