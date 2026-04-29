import type { Metadata } from "next";
import InsightsClient from "@/components/InsightsClient";

export const metadata: Metadata = {
  title: "Insights 4 Recruitment & Talent Strategy",
  description: "Expert articles and podcasts on AI recruitment, talent strategy, executive search, and skill-based hiring from Merito.",
};

export default function InsightsPage() {
  return <InsightsClient />;
}
