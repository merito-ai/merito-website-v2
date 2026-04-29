
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Merito 4 Start Hiring Smarter",
  description: "Talk to a Merito expert. Share your talent requirements and get a curated shortlist within 57 days.",
};

import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-24 text-center">
      <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[40px] text-black mb-6">
        Contact Us
      </h1>
      <p className="text-[18px] text-[#4b4b4d] leading-[165%] mb-12 max-w-[600px] mx-auto">
        Talk to our team about your hiring needs. We&apos;ll get back to you within 24 hours with a custom talent strategy.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-12 max-w-5xl mx-auto">
        <ContactForm />
        
        <div className="hidden lg:flex flex-col items-center gap-4">
          <div className="w-px h-24 bg-gray-200" />
          <span className="text-gray-400 font-bold text-sm">OR</span>
          <div className="w-px h-24 bg-gray-200" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="text-[16px] font-bold text-black uppercase tracking-widest">Direct Contact</p>
          <a
            href="mailto:hello@merito.ai"
            className="inline-flex items-center gap-3 bg-[#111] text-white font-semibold px-8 py-4 rounded-lg hover:bg-black transition-colors text-lg shadow-xl"
          >
            hello@merito.ai
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 11l-5-5-5 5m10 0V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3M3 7h18M12 10v6m0 0l3-3m-3 3l-3-3"></path>
            </svg>
          </a>
          <p className="text-sm text-gray-400">Response time: &lt; 24h</p>
        </div>
      </div>
    </div>
  );
}
