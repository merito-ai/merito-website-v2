"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Play } from "lucide-react";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import InterviewPaywallModal from "../InterviewPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SampleInterviewReport from "./SampleInterviewReport";

const IMPACT_POINTS = [
  "Burns your first attempt somewhere it costs nothing, instead of in a round that counts.",
  "Scores you question by question, so you know which answers would have lost the offer.",
  "Hands you a phased roadmap: what to study, in what order, with what resources.",
];

const STEPS = [
  "Answer 10 role-matched questions on camera",
  "Get scored on 5 weighted parameters plus a per-skill breakdown",
  "Walk away with a strengths/gaps analysis and a phased improvement roadmap",
];

const ALSO_INCLUDED = [
  "Full skill-wise evaluation, scored and explained",
  "Your strengths and areas of improvement, written out",
  "A 3-phase roadmap: short, mid and long term, with resources",
  "Evaluator notes for hiring teams, including the hire recommendation",
];

export default function InterviewLockedState({
  leadId,
  roleTitle,
  level,
  userEmail,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  userEmail: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.interview[level]);

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Play size={15} strokeWidth={2} />
      Start my mock interview for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={Mic}
      title="Mock AI interview"
      priceLabel={priceLabel}
      hook="You've never been interviewed at this level, and the first attempt will be a real one."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={620} alsoIncluded={ALSO_INCLUDED} cta={cta}>
          <SampleInterviewReport />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <InterviewPaywallModal
            leadId={leadId}
            roleTitle={roleTitle}
            level={level}
            userEmail={userEmail}
            onClose={() => setModalOpen(false)}
            onStarted={() => {
              setModalOpen(false);
              router.refresh();
            }}
          />
        ) : null
      }
    />
  );
}
