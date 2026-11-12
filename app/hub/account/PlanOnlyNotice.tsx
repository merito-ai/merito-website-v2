import Link from "next/link";

export default function PlanOnlyNotice() {
  return (
    <div className="font-[family-name:var(--font-poppins)]" style={{ textAlign: "center" }}>
      <p className="text-[#6b6b6b]" style={{ fontSize: 13, margin: "0 0 12px" }}>
        This is included in your Merito plans.
      </p>
      <Link
        href="/hub/account/pricing"
        className="inline-block font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
        style={{ borderRadius: 8, padding: "11px 20px", fontSize: 14 }}
      >
        See plans
      </Link>
    </div>
  );
}
