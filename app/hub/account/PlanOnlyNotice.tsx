import UnlockPlansButton from "./guide/UnlockPlansButton";

// Allowlisted users without a plan, in any feature paywall: the shared plans popup instead of single prices.
export default function PlanOnlyNotice() {
  return (
    <div className="font-[family-name:var(--font-poppins)]" style={{ textAlign: "center" }}>
      <p className="text-[#6b6b6b]" style={{ fontSize: 13, margin: "0 0 12px" }}>
        This is included in your Merito plans.
      </p>
      <UnlockPlansButton />
    </div>
  );
}
