import Link from "next/link";
import { notFound } from "next/navigation";
import { findDuplicateCandidates, getCandidateDetail, isCandidateBanned, listCandidateNotifications } from "@/lib/adminCandidates";
import { listPaymentsForCandidate, listUnpaidUnlocks } from "@/lib/adminPayments";
import { getCandidateEntitlements, type EntitlementStatus } from "@/lib/adminEntitlements";
import { PRODUCT_PRICING, DEFAULT_LEVEL, type CandidateLevel, type RazorpayProduct } from "@/lib/razorpay/pricing";
import GrantForm from "@/app/admin/payments/GrantForm";
import ReconcileForm from "@/app/admin/payments/ReconcileForm";
import PaymentActions from "@/app/admin/payments/PaymentActions";
import { paymentStatusBadge, PRODUCT_LABEL } from "@/app/admin/payments/paymentStatus";
import { recordCandidateView } from "@/lib/adminRecentViews";
import { requireAdmin } from "@/lib/adminAuth";
import RefereeSummary from "./RefereeSummary";
import ShareLinkRevokeToggle from "./ShareLinkRevokeToggle";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge from "@/app/admin/_components/Badge";
import AccountActions from "./AccountActions";
import SendNotificationAction from "./SendNotificationAction";
import RecruiterPreviewOverrideForm from "./RecruiterPreviewOverrideForm";
import CandidateProfileOverrideForm from "./CandidateProfileOverrideForm";
import ReportsTab from "./ReportsTab";
import ActivityFeed from "./ActivityFeed";
import Tabs, { type TabDef } from "@/app/admin/_components/Tabs";
import type { AdminActionRow } from "@/lib/adminAuditLog";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

const sectionHeading: React.CSSProperties = { fontSize: "1.1rem", margin: "0 0 14px" };

function formatAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: EntitlementStatus }) {
  return <Badge variant={status.tone}>{status.label}</Badge>;
}
const emptyNote: React.CSSProperties = { fontSize: 13 };

export default async function AdminCandidateDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { userId } = await params;
  const { tab } = await searchParams;
  const candidate = await getCandidateDetail(userId);

  if (!candidate) {
    notFound();
  }

  const admin = await requireAdmin();
  try {
    await recordCandidateView(admin.email as string, candidate.userId, candidate.email, candidate.name);
  } catch (error) {
    console.error("Failed to record candidate view", { userId, error });
  }

  const [notifications, payments, banned, entitlements, allUnpaid, duplicates] = await Promise.all([
    listCandidateNotifications(candidate.userId),
    listPaymentsForCandidate(candidate.userId),
    isCandidateBanned(candidate.userId),
    getCandidateEntitlements(candidate.userId),
    listUnpaidUnlocks(),
    findDuplicateCandidates(),
  ]);
  const unpaid = allUnpaid.filter((u) => u.userId === candidate.userId);
  const possibleDuplicate = [...duplicates.byEmail, ...duplicates.byName].some((g) => g.candidates.some((c) => c.userId === candidate.userId));
  const level = (entitlements.roles[0]?.level as CandidateLevel | null) ?? DEFAULT_LEVEL;

  const allActivityRaw: AdminActionRow[] = [
    ...candidate.allActions,
    ...candidate.leads.flatMap((lead) => lead.interviewOverrideHistory),
    ...(candidate.references?.referees.flatMap((referee) => referee.overrideHistory) ?? []),
  ];
  // Dedupe by id: two fitment_leads rows sharing a role_title resolve to the
  // same interviewRow in getCandidateDetail(), so their interviewOverrideHistory
  // arrays -- and thus this merge -- can contain the same AdminActionRow twice.
  const allActivity = [...new Map(allActivityRaw.map((row) => [row.id, row])).values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const tabs: TabDef[] = [
    {
      id: "summary",
      label: "Summary",
      content: (
        <div>
          <section style={{ marginBottom: 32 }}>
            <Table>
              <TableHeadRow columns={["Role", "Report", "Interview", "Files"]} />
              <tbody>
                {entitlements.roles.map((r) => (
                  <TableRow key={r.leadId}>
                    <TableCell>{r.roleTitle}</TableCell>
                    <TableCell>
                      <StatusBadge status={r.report} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.interview} />
                    </TableCell>
                    <TableCell>
                      <span className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 13, display: "inline-flex", gap: 12, flexWrap: "wrap" }}>
                        <a className="font-semibold text-[#ed1a24]" href={`/api/admin/candidates/${candidate.userId}/cv?lead=${r.leadId}`}>
                          Download CV
                        </a>
                        <a
                          className="font-semibold text-[#ed1a24]"
                          href={`/api/admin/candidates/${candidate.userId}/export?role=${encodeURIComponent(r.roleTitle)}`}
                        >
                          Download report (PDF)
                        </a>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
              {([
                ["Personality", entitlements.account.personality],
                ["References", entitlements.account.references],
                ["Counselling", entitlements.account.counselling],
                ["Plan", entitlements.account.plan],
              ] as const).map(([label, status]) => (
                <div key={label} className="bg-white border border-black/[0.08]" style={{ borderRadius: 10, padding: "10px 14px" }}>
                  <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 11, margin: "0 0 4px" }}>
                    {label}
                  </p>
                  <StatusBadge status={status} />
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginBottom: 32 }}>
            <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
              Profile
            </h3>
            <CandidateProfileOverrideForm
              userId={candidate.userId}
              phoneNumber={candidate.profileOverride?.phoneNumber ?? candidate.leads.find((l) => l.candidateDetails)?.candidateDetails?.phoneNumber ?? null}
              location={candidate.profileOverride?.location ?? candidate.leads.find((l) => l.candidateDetails)?.candidateDetails?.location ?? null}
              totalExperience={
                candidate.profileOverride?.totalExperience ?? candidate.leads.find((l) => l.candidateDetails)?.candidateDetails?.totalExperience ?? null
              }
              overrideHistory={candidate.profileOverrideHistory}
            />
          </section>

          <details>
            <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
              Send a notification
            </summary>
            <div style={{ marginTop: 10 }}>
              <SendNotificationAction userId={candidate.userId} />
            </div>
          </details>
        </div>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      content: (
        <ReportsTab email={candidate.email} candidateName={candidate.name || candidate.email} leads={candidate.leads} personality={candidate.personality} />
      ),
    },
    {
      id: "references",
      label: "References",
      content: candidate.references ? (
        <div>
          <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 13, margin: "0 0 14px" }}>
            Status: {candidate.references.status} · {candidate.references.report.referees.length}/{candidate.references.minReferences} completed
          </p>
          <RefereeSummary referees={candidate.references.referees} />
        </div>
      ) : (
        <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={emptyNote}>
          Not started yet.
        </p>
      ),
    },
    {
      id: "recruiter-preview",
      label: "Recruiter visibility",
      content: (
        <div>
          <div style={{ marginBottom: 20 }}>
            <RecruiterPreviewOverrideForm
              userId={candidate.userId}
              settings={candidate.recruiterPreview.settings}
              overrideHistory={candidate.recruiterPreview.overrideHistory}
            />
          </div>

          <Table>
            <TableHeadRow columns={["Role", "Status", "Views", "Last viewed", "Expires", ""]} />
            <tbody>
              {candidate.recruiterPreview.shareLinks.map((link) => (
                <TableRow key={link.token}>
                  <TableCell>{link.roleTitle}</TableCell>
                  <TableCell>
                    <Badge variant={link.revoked || link.expired ? "neutral" : "success"}>
                      {link.revoked ? "Revoked" : link.expired ? "Expired" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.viewCount}</TableCell>
                  <TableCell>{formatDate(link.lastViewedAt)}</TableCell>
                  <TableCell>{formatDate(link.expiresAt)}</TableCell>
                  <TableCell>
                    <ShareLinkRevokeToggle token={link.token} revoked={link.revoked} />
                  </TableCell>
                </TableRow>
              ))}
              {candidate.recruiterPreview.shareLinks.length === 0 && (
                <TableEmptyRow colSpan={6} message="No share links created yet." />
              )}
            </tbody>
          </Table>
        </div>
      ),
    },
    {
      id: "billing",
      label: "Billing",
      content: (
        <div>
          <section style={{ marginBottom: 32 }}>
            <Table>
              <TableHeadRow columns={["Product", "Amount", "Status", "Date", ""]} />
              <tbody>
                {payments.map((p) => {
                  const badge = paymentStatusBadge(p.status, p.createdAt);
                  return (
                    <TableRow key={p.orderId}>
                      <TableCell>
                        {PRODUCT_LABEL[p.product] ?? p.product}
                        {p.roleTitle && <span className="text-[#9c9c9c]"> · {p.roleTitle}</span>}
                      </TableCell>
                      <TableCell>{formatAmount(p.amountPaise)}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(p.createdAt)}</TableCell>
                      <TableCell>
                        <PaymentActions orderId={p.orderId} status={p.status} amountPaise={p.amountPaise} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {payments.length === 0 && <TableEmptyRow colSpan={5} message="No payments yet." />}
              </tbody>
            </Table>
          </section>

          {unpaid.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
                Unlocked without payment
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {unpaid.map((u, i) => (
                  <div key={`${u.kind}-${u.leadId ?? i}`} className="flex items-center" style={{ gap: 12, flexWrap: "wrap" }}>
                    <span className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 13, minWidth: 180 }}>
                      {PRODUCT_LABEL[u.kind]}
                      {u.roleTitle && <span className="text-[#9c9c9c]"> · {u.roleTitle}</span>}
                    </span>
                    <ReconcileForm userId={u.userId} leadId={u.leadId} product={u.kind} defaultAmountPaise={PRODUCT_PRICING[u.kind as RazorpayProduct][level]} />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={sectionHeading}>
              Grant free access
            </h3>
            <GrantForm email={candidate.email} roles={entitlements.roles.map((r) => ({ leadId: r.leadId, roleTitle: r.roleTitle }))} level={level} />
          </section>
        </div>
      ),
    },
    {
      id: "activity",
      label: "Activity",
      content: <ActivityFeed adminActions={allActivity} notifications={notifications} payments={payments} />,
    },
    {
      id: "account",
      label: "Account",
      content: <AccountActions userId={candidate.userId} email={candidate.email} banned={banned} pendingDeletion={candidate.pendingDeletion} />,
    },
  ];

  return (
    <div>
      <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.4rem", margin: "0 0 4px" }}>
        {candidate.name || candidate.email}
      </h2>
      <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap", margin: "0 0 28px" }}>
        <span className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13 }}>
          {candidate.email} · Paid {formatAmount(entitlements.totalPaidPaise)}
          {entitlements.unusedInterviewCredits > 0 && ` · ${entitlements.unusedInterviewCredits} unused interview credit${entitlements.unusedInterviewCredits === 1 ? "" : "s"}`}
        </span>
        {banned && <Badge variant="danger">Banned</Badge>}
        {candidate.pendingDeletion && <Badge variant="danger">Pending deletion</Badge>}
        {possibleDuplicate && (
          <Link href="/admin/duplicates">
            <Badge variant="warning">Possible duplicate</Badge>
          </Link>
        )}
      </div>

      <Tabs tabs={tabs} initialTab={tab ?? ""} />
    </div>
  );
}
