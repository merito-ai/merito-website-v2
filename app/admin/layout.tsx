import { requireAdmin } from "@/lib/adminAuth";
import { getRecentCandidateViews } from "@/lib/adminRecentViews";
import AdminSidebar from "@/app/admin/_components/AdminSidebar";
import { ToastProvider } from "@/app/admin/_components/Toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const recentViews = await getRecentCandidateViews(user.email ?? "");

  return (
    <ToastProvider>
      {/* Narrow screens: sidebar stacks above the page so nothing scrolls sideways. */}
      <div className="flex flex-col md:flex-row" style={{ minHeight: "100vh", background: "#f9fafd" }}>
        <AdminSidebar adminEmail={user.email ?? ""} recentViews={recentViews} />
        <main className="px-4 py-6 md:px-8 md:py-10" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
