import Link from "next/link";
import { getNeedsAttention, getRevenueBreakdown, getWeeklyTrends } from "@/lib/adminAnalytics";
import { parseInternalList } from "@/lib/adminInternal";
import PageHeader from "@/app/admin/_components/PageHeader";

function formatAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString("en-IN")}`;
}

const card = "bg-white border border-black/[0.08]";

export default async function AdminHomePage({ searchParams }: { searchParams: Promise<{ internal?: string }> }) {
  const { internal } = await searchParams;
  const includeInternal = internal === "1";
  const [items, [thisWeek], revenue] = await Promise.all([
    getNeedsAttention(includeInternal),
    getWeeklyTrends(1, includeInternal),
    getRevenueBreakdown(includeInternal),
  ]);
  const hasInternalList = parseInternalList().length > 0;

  return (
    <div>
      <PageHeader title="Home" description="What needs you today. Each item links to where you fix it.">
        {hasInternalList && (
          <Link
            href={includeInternal ? "/admin" : "/admin?internal=1"}
            className="font-[family-name:var(--font-poppins)] text-[#9c9c9c]"
            style={{ fontSize: 12, whiteSpace: "nowrap" }}
          >
            {includeInternal ? "Hide team accounts" : "Show team accounts"}
          </Link>
        )}
      </PageHeader>

      {items.length === 0 ? (
        <p className="font-[family-name:var(--font-poppins)]" style={{ fontSize: 14, color: "#16803c", margin: "0 0 32px" }}>
          All clear. Nothing needs you right now.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 32 }}>
          {items.map((item) => (
            <div key={item.key} className={card} style={{ borderRadius: 14, padding: "14px 16px" }}>
              <p className="font-[family-name:var(--font-gabarito)] font-semibold text-black" style={{ fontSize: 24, margin: 0 }}>
                {item.count}
              </p>
              <p className="font-[family-name:var(--font-poppins)] text-[#4b4b4d]" style={{ fontSize: 13, margin: "2px 0 8px" }}>
                {item.label}
              </p>
              {item.href && (
                <Link href={item.href} className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]" style={{ fontSize: 12 }}>
                  Open
                </Link>
              )}
              {item.people && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {item.people.map((p) => (
                    <Link
                      key={p.userId}
                      href={`/admin/candidates/${p.userId}`}
                      className="font-[family-name:var(--font-poppins)] text-[#ed1a24]"
                      style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                    >
                      {p.email}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="font-[family-name:var(--font-poppins)] uppercase text-[#9c9c9c]" style={{ fontSize: 11, letterSpacing: "0.04em", margin: "0 0 8px" }}>
        This week
      </p>
      <p className="font-[family-name:var(--font-poppins)] text-black" style={{ fontSize: 14, margin: "0 0 8px" }}>
        {thisWeek?.newCandidates ?? 0} new candidates · {formatAmount(thisWeek?.revenuePaise ?? 0)} revenue · {formatAmount(revenue.totalThisMonthPaise)} this month
      </p>
      <Link href="/admin/insights" className="font-[family-name:var(--font-poppins)] font-semibold text-[#ed1a24]" style={{ fontSize: 13 }}>
        See all insights
      </Link>
    </div>
  );
}
