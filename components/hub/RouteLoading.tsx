// Shared Next.js loading.tsx UI for hub/account route segments. AppShell's
// background persists across navigation (it lives in layout.tsx), so this
// only needs to fill the content slot -- no bg of its own, avoids a flash.
export default function RouteLoading() {
  return (
    <div
      style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}
      role="status"
      aria-label="Loading"
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "#ed1a24",
          animation: "hub-route-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes hub-route-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
