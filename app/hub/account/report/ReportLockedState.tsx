"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Unlock } from "lucide-react";
import { PRODUCT_PRICING, formatPrice, type CandidateLevel } from "@/lib/razorpay/pricing";
import type { ResumeMatchReportReady } from "@/lib/intervuebox/reports";
import { SAMPLE_FITMENT_REPORT } from "@/lib/sampleReports/fitment";
import ReportPaywallModal from "../ReportPaywallModal";
import LockedFeatureLayout from "../LockedFeatureLayout";
import SamplePreviewFrame from "../SamplePreviewFrame";
import SampleFitmentReport from "./SampleFitmentReport";

const IMPACT_POINTS = [
  "Scores your CV against this exact job description across six dimensions, so the gap stops being a guess.",
  "Names your weak points in the language a recruiter screens with, not the language you'd use.",
  "Tells you which two things to fix before the next application, ranked by what costs you most.",
];

const STEPS = [
  "Your CV is scored against this JD as soon as both are in",
  "Unlock to read all six dimensions, each with its reasoning",
  "Work through the ranked gaps before you apply again",
];

const ALSO_INCLUDED = [
  "The remaining three dimension scores, each explained",
  "Your strong points, written out",
  "Your gaps, written out and ranked",
  "Full candidate profile: education and experience timeline",
];

export default function ReportLockedState({
  leadId,
  roleTitle,
  level,
  bundleEligible,
  report,
}: {
  leadId: string;
  roleTitle: string;
  level: CandidateLevel;
  bundleEligible: boolean;
  report: ResumeMatchReportReady | null;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const priceLabel = formatPrice(PRODUCT_PRICING.report[level]);

  // The fitment report is generated before purchase, so a locked candidate
  // normally sees their own real numbers here. The fixture only stands in
  // while the report is still PENDING.
  const isRealData = report !== null;
  const previewReport = report ?? SAMPLE_FITMENT_REPORT;

  const cta = (
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center font-[family-name:var(--font-poppins)] font-semibold text-white bg-[#ed1a24] hover:bg-[#c8151e] transition-colors"
      style={{ gap: 8, height: 48, padding: "0 24px", borderRadius: 8, fontSize: 14.5, border: "none", cursor: "pointer" }}
    >
      <Unlock size={15} strokeWidth={2} />
      Unlock full report for {priceLabel}
    </button>
  );

  return (
    <LockedFeatureLayout
      icon={FileText}
      title="Fitment report"
      priceLabel={priceLabel}
      hook="You keep applying and hearing nothing back, and nobody tells you why."
      impactPoints={IMPACT_POINTS}
      steps={STEPS}
      preview={
        <SamplePreviewFrame cropHeight={420} alsoIncluded={ALSO_INCLUDED} cta={cta} isRealData={isRealData}>
          <SampleFitmentReport report={previewReport} />
        </SamplePreviewFrame>
      }
      modal={
        modalOpen ? (
          <ReportPaywallModal
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
