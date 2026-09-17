"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Unlock } from "lucide-react";
import { MIN_REFERENCES } from "@/lib/referenceChecks";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import ReferencesPaywallModal from "../ReferencesPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SampleReferenceReport from "./SampleReferenceReport";

const IMPACT_POINTS = [
  "Collects and verifies your references up front, so trust stops being the thing that stalls an offer.",
  "Shows you what your referees actually say while there is still time to act on it.",
  "Lets you arrive with references already done, which almost no other candidate does.",
];

const STEPS = [
  `Invite at least ${MIN_REFERENCES} people who have worked with you`,
  "They rate you across seven categories and leave written feedback",
  "Your verified reference report is ready to share with recruiters",
];

const ALSO_INCLUDED = [
  "All seven rated categories, with each referee's individual score",
  "Every referee's written feedback in full",
  "A shareable verified report for recruiters",
];

export default function ReferencesLockedState({
  leadId,
  level,
  bundleEligible,
}: {
  leadId: string;
  level: CandidateLevel;
  bundleEligible: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.references[level]);

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Unlock size={15} strokeWidth={2} />
      Start my reference checks for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={Users}
      title="Reference checks"
      priceLabel={priceLabel}
      hook="Your references are a black box that opens at the worst possible moment."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={420} alsoIncluded={ALSO_INCLUDED} cta={cta}>
          <SampleReferenceReport />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <ReferencesPaywallModal
            leadId={leadId}
            level={level}
            bundleEligible={bundleEligible}
            onClose={() => setModalOpen(false)}
            onUnlocked={() => {
              setModalOpen(false);
              router.refresh();
            }}
          />
        ) : null
      }
    />
  );
}
