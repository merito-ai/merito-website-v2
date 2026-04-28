
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Merito 4 Start Hiring Smarter",
  description: "Talk to a Merito expert. Share your talent requirements and get a curated shortlist within 57 days.",
};

import ContactForm from "../../components/ContactForm";

export default function ContactPage() {
  return <ContactForm />;
}
