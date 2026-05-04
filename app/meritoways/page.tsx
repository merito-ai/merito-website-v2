import type { Metadata } from "next";
import MeritowaysClient from "@/components/MeritowaysClient";

export const metadata: Metadata = {
  title: "The Merito Way — Our AI Recruitment Process | Merito",
  description: "Discover how Merito's AI-powered recruitment process delivers top 2% talent in 48 hours with the ICE assessment framework and 85% two-year retention.",
  openGraph: {
    title: "The Merito Way — Our AI Recruitment Process",
    description: "48-hour sourcing. ICE assessment. 85% two-year retention. See how Merito hires differently.",
    url: "https://meritoai.netlify.app/meritoways",
  },
  alternates: {
    canonical: "/meritoways",
  },
};

export default function MeritowaysPage() {
  return <MeritowaysClient />;
}
