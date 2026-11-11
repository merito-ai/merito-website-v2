import Link from "next/link";
import { INTERVIEW_CREDIT_PRODUCTS } from "@/lib/interviewCredits";
import { listTransactions, listUnpaidUnlocks } from "@/lib/adminPayments";
import { PRODUCT_PRICING, type RazorpayProduct } from "@/lib/razorpay/pricing";
import { Table, TableHeadRow, TableRow, TableCell, TableEmptyRow } from "@/app/admin/_components/Table";
import Badge from "@/app/admin/_components/Badge";
import Pagination from "@/app/admin/_components/Pagination";
import PageHeader from "@/app/admin/_components/PageHeader";
import ReconcileForm from "./ReconcileForm";
import PaymentActions from "./PaymentActions";
import GrantForm from "./GrantForm";
import { paymentStatusBadge, PRODUCT_LABEL } from "./paymentStatus";

const UNPAID_KIND_LABEL: Record<string, string> = {
  report: "Report",
  personality: "Personality",
  references: "References",
};

function formatAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function filterStyle(active: boolean): React.CSSProperties {
  return {
    fontSize: 12.5,
    padding: "4px 12px",
    borderRadius: 20,
    border: `1px solid ${active ? "#ed1a24" : "#dcdcdc"}`,
    color: active ? "#ed1a24" : "#4b4b4d",
  };
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ page?: string; product?: string }> }) {
  const { page: pageParam, product: productParam } = await searchParams;
  const product = productParam && productParam in PRODUCT_LABEL ? productParam : undefined;
  const [{ rows: transactions, page, totalPages }, unpaidUnlocks] = await Promise.all([
    listTransactions(Number(pageParam) || 1, product),
    listUnpaidUnlocks(),
  ]);

  return (
    <div>
      <PageHeader title="Payments" description="Every checkout, newest first. Refund or void here. Grants and reconciles also live on each candidate's Billing tab." />

      <div className="flex items-center" style={{ gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <Link href="/admin/payments" className="font-[family-name:var(--font-poppins)]" style={filterStyle(!product)}>
          All
        </Link>
        {Object.entries(PRODUCT_LABEL).map(([key, label]) => (
          <Link key={key} href={`/admin/payments?product=${key}`} className="font-[family-name:var(--font-poppins)]" style={filterStyle(product === key)}>
            {label}
          </Link>
        ))}
      </div>

      <div style={{ marginBottom: 40 }}>
        <Table>
          <TableHeadRow columns={["Candidate", "Product", "Amount", "Status", "Date", ""]} />
          <tbody>
            {transactions.map((t) => {
              const badge = paymentStatusBadge(t.status, t.createdAt);
              return (
                <TableRow key={t.orderId}>
                  <TableCell>
                    <Link href={`/admin/candidates/${t.userId}?tab=billing`} className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]">
                      {t.email}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {PRODUCT_LABEL[t.product] ?? t.product}
                    {t.roleTitle && <span className="text-[#9c9c9c]"> · {t.roleTitle}</span>}
                    {t.status === "success" && (INTERVIEW_CREDIT_PRODUCTS as readonly string[]).includes(t.product) && (
                      <span className={t.consumedAt ? "text-[#9c9c9c]" : "text-[#b45309]"}> · {t.consumedAt ? "interview used" : "interview not used yet"}</span>
                    )}
                  </TableCell>
                  <TableCell>{formatAmount(t.amountPaise)}</TableCell>
                  <TableCell>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(t.createdAt)}</TableCell>
                  <TableCell>
                    <PaymentActions orderId={t.orderId} status={t.status} amountPaise={t.amountPaise} />
                  </TableCell>
                </TableRow>
              );
            })}
            {transactions.length === 0 && <TableEmptyRow colSpan={6} message="No payments yet." />}
          </tbody>
        </Table>
        <Pagination page={page} totalPages={totalPages} basePath={product ? `/admin/payments?product=${product}` : "/admin/payments"} />
      </div>

      <h2 className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: "1.1rem", margin: "0 0 4px" }}>
        Unlocked without payment
      </h2>
      <p className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 13, margin: "0 0 14px" }}>
        If they paid outside the checkout, Reconcile records the payment. No money moves.
      </p>
      <Table>
        <TableHeadRow columns={["Candidate", "Unlock", "Date", ""]} />
        <tbody>
          {unpaidUnlocks.map((u, i) => (
            <TableRow key={`${u.userId}-${u.kind}-${u.leadId ?? i}`}>
              <TableCell>
                <Link href={`/admin/candidates/${u.userId}?tab=billing`} className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]">
                  {u.email}
                </Link>
              </TableCell>
              <TableCell>
                {UNPAID_KIND_LABEL[u.kind]}
                {u.roleTitle && <span className="text-[#9c9c9c]"> · {u.roleTitle}</span>}
              </TableCell>
              <TableCell>{formatDate(u.unlockedAt)}</TableCell>
              <TableCell>
                {/* shortcut: report/personality/references cost the same at every level, so entry is the list price; use the candidate level if that changes. */}
                <ReconcileForm userId={u.userId} leadId={u.leadId} product={u.kind} defaultAmountPaise={PRODUCT_PRICING[u.kind as RazorpayProduct].entry} />
              </TableCell>
            </TableRow>
          ))}
          {unpaidUnlocks.length === 0 && <TableEmptyRow colSpan={4} message="None. Every unlock has a payment." tone="success" />}
        </tbody>
      </Table>

      <details style={{ marginTop: 32 }}>
        <summary className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]" style={{ fontSize: 12, cursor: "pointer" }}>
          Grant free access by email
        </summary>
        <div style={{ marginTop: 10 }}>
          <GrantForm />
        </div>
      </details>
    </div>
  );
}
