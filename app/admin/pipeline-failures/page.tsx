import Link from "next/link";
import { listUnresolvedPipelineFailures } from "@/lib/pipelineFailures";
import { getSupabaseServerClient } from "@/lib/supabase";
import { formatValue, formatKey } from "@/lib/adminLabels";
import PipelineFailureActions from "./PipelineFailureActions";
import EmptyState from "@/app/admin/_components/EmptyState";
import PageHeader from "@/app/admin/_components/PageHeader";

const KIND_LABEL: Record<string, string> = {
  interview_invite_after_payment: "Paid, but no interview was created",
  orphaned_ib_job: "Interview vendor job left without a candidate",
  interview_invite_failed: "Interview invite failed, candidate can retry for free",
};

function formatAge(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
}

export default async function AdminPipelineFailuresPage() {
  const failures = await listUnresolvedPipelineFailures();
  const userIds = Array.from(new Set(failures.map((f) => f.userId).filter((id): id is string => Boolean(id))));
  const { data: leadRows } = userIds.length
    ? await getSupabaseServerClient().from("fitment_leads").select("user_id, email").in("user_id", userIds)
    : { data: [] as { user_id: string; email: string }[] };
  const emailByUser = new Map((leadRows ?? []).map((r) => [r.user_id as string, r.email as string]));

  return (
    <div>
      <PageHeader title="Pipeline failures" description="Paid or started steps that broke. Retry or discard each one." />
      {failures.length === 0 ? (
        <div className="bg-white border border-black/[0.08]" style={{ borderRadius: 14 }}>
          <EmptyState message="Nothing broken." tone="success" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {failures.map((f) => (
            <div key={f.id} className="bg-white border border-black/[0.08]" style={{ borderRadius: 14, padding: "14px 16px" }}>
              <p className="font-[family-name:var(--font-poppins)] font-semibold text-black" style={{ fontSize: 13, margin: "0 0 4px" }}>
                {KIND_LABEL[f.kind] ?? formatKey(f.kind)}
              </p>
              <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 12, margin: "0 0 10px" }}>
                {f.userId ? (
                  <Link href={`/admin/candidates/${f.userId}`} className="font-semibold text-[#ed1a24]">
                    {emailByUser.get(f.userId) ?? "Open candidate"}
                  </Link>
                ) : (
                  "No candidate linked"
                )}
                {" · "}
                {formatAge(f.createdAt)}
              </p>
              <details style={{ marginBottom: 10 }}>
                <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
                  Details
                </summary>
                <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 12, margin: "6px 0 0", wordBreak: "break-word" }}>
                  {formatValue(f.detail)}
                </p>
              </details>
              <PipelineFailureActions id={f.id} kind={f.kind} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
