import type { Metadata } from "next";
import InsightsClient from "@/components/InsightsClient";

export const metadata: Metadata = {
  title: "Insights — Recruitment & Talent Strategy | Merito",
  description: "Expert articles and podcasts on AI recruitment, talent strategy, executive search, and skill-based hiring. Insights from India's leading AI recruitment agency.",
  openGraph: {
    title: "Insights — Recruitment & Talent Strategy | Merito",
    description: "Expert articles on AI recruitment, campus hiring, and talent strategy from Merito.",
    url: "https://www.merito.in/insights",
  },
  alternates: {
    canonical: "/insights",
  },
};

export default function InsightsPage() {
  return <InsightsClient />;
}
