import type { Metadata } from "next";
import MeritowaysClient from "@/components/MeritowaysClient";

export const metadata: Metadata = {
  title: "The Merito Way 4 Our Hiring Process",
  description: "How Merito's AI-powered recruitment process delivers top 2% talent in 48 hours with 85% two-year retention.",
};

export default function MeritowaysPage() {
  return <MeritowaysClient />;
}
