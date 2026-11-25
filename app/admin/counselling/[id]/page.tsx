import { notFound } from "next/navigation";
import { getCounsellingRequest, ALLOWED_TRANSITIONS, isoToIstLocal } from "@/lib/adminCounselling";
import { dateTime } from "@/lib/planPanel";
import { syncCalendlyBookings } from "@/lib/calendly";
import { listActionsForTarget } from "@/lib/adminAuditLog";
import CounsellingStatusForm from "./CounsellingStatusForm";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default async function AdminCounsellingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await getCounsellingRequest(id);
  const synced = found ? await syncCalendlyBookings({ userId: found.userId, email: found.email.includes("@") ? found.email : null }) : false;
  const request = synced ? await getCounsellingRequest(id) : found;

  if (!request) {
    notFound();
  }

  const statusHistory = (await listActionsForTarget("counselling_request", id)).filter((row) => row.action === "counselling.status_change");

  return (
    <div>
      <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 4px" }}>
        {request.email}
      </h2>
      <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 13, margin: "0 0 28px" }}>
        {request.sessionLabel && `${request.sessionLabel} · `}Order {request.orderId} · Requested {formatDate(request.requestedAt)}
        {request.scheduledAt && ` · Scheduled ${formatDate(request.scheduledAt)}`}
        {request.sessionAt && ` · Call ${dateTime(request.sessionAt)} IST`}
        {request.completedAt && ` · Completed ${formatDate(request.completedAt)}`}
        {request.autoCompleted && " · Completed (auto, call time passed)"}
      </p>

      {request.feedbackAt && (
        <div className="bg-white border border-black/[0.08] font-[family-name:var(--font-poppins)]" style={{ borderRadius: 14, padding: 20, marginBottom: 20 }}>
          <p className="font-semibold text-black" style={{ fontSize: 13, margin: "0 0 4px" }}>
            Candidate feedback: {request.rating}/5
          </p>
          <p className="text-[#9c9c9c]" style={{ fontSize: 12, margin: 0 }}>
            {formatDate(request.feedbackAt)}
          </p>
          {request.feedback && (
            <p className="text-black" style={{ fontSize: 13, margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
              {request.feedback}
            </p>
          )}
        </div>
      )}

      <CounsellingStatusForm
        id={request.id}
        currentStatus={request.status}
        currentNotes={request.notes}
        currentSessionAt={request.sessionAt ? isoToIstLocal(request.sessionAt) : ""}
        allowedNext={ALLOWED_TRANSITIONS[request.status]}
        statusHistory={statusHistory}
      />
    </div>
  );
}
