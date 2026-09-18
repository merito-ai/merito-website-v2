"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Play } from "lucide-react";
import { ITEMS, IMPRESSION_ITEMS } from "@/lib/personality";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import PersonalityPaywallModal from "../PersonalityPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SamplePersonalityReport from "./SamplePersonalityReport";

const TOTAL_STATEMENTS = ITEMS.length + IMPRESSION_ITEMS.length;

const IMPACT_POINTS = [
  "Behavioural rounds decide most offers, and they test something a CV physically cannot show.",
  "Gives you evidence-backed language for how you work, so “tell me about yourself” stops being adjectives.",
  "Flags the watch-outs an interviewer will probe, before they probe them.",
];

const STEPS = [
  `Rate ${TOTAL_STATEMENTS} short statements, 1 (inaccurate) to 5 (accurate)`,
  "Get your Extroversion, Agreeableness, Conscientiousness, Emotional Stability and Openness scores instantly",
  "Read what each score suggests about how you'll show up at work",
];

const ALSO_INCLUDED = [
  "All five trait cards: what each measures and what it means at work",
  "Your watch-outs and best-fit environments per trait",
  "Response-quality and validity checks on your answers",
];

export default function PersonalityLockedState({
  leadId,
  roleTitle,
  level,
  bundleEligible,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  bundleEligible: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.personality[level]);

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Play size={15} strokeWidth={2} fill="currentColor" />
      Start my personality test for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={ClipboardList}
      title="Personality test"
      priceLabel={priceLabel}
      hook="Your technical rounds go fine. You still don't get picked."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={430} alsoIncluded={ALSO_INCLUDED} cta={cta}>
          <SamplePersonalityReport />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <PersonalityPaywallModal
            leadId={leadId}
            roleTitle={roleTitle}
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
