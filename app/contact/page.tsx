import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Merito — Start Hiring Smarter Today",
  description: "Talk to a Merito expert about your talent requirements. Get a curated shortlist within 48 hours. AI recruitment agency India. Response within 24 hours.",
  openGraph: {
    title: "Contact Merito — Start Hiring Smarter Today",
    description: "Share your hiring needs. Get a curated shortlist in 48 hours. India's AI-powered recruitment agency.",
    url: getAbsoluteUrl("/contact"),
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f8f9fb] py-16 lg:py-24 relative overflow-hidden">
      {/* Background subtle elements */}
      <div className="absolute top-0 right-0 w-1/3 h-[600px] bg-gradient-to-b from-[#ed1a24]/5 to-transparent blur-3xl pointer-events-none" />
      
      <div className="mx-auto max-w-7xl px-5 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ed1a24]/10 text-[#ed1a24] font-bold text-[13px] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#ed1a24] animate-pulse" />
              Available for new partnerships
            </div>
            
            <h1 className="font-[family-name:var(--font-gabarito)] text-[44px] md:text-[60px] font-bold text-black leading-[1.05] mb-6 tracking-[-0.02em]">
              Let&apos;s find the <br />
              <span className="text-[#ed1a24]">right talent.</span>
            </h1>
            
            <p className="text-[18px] text-[#4b4b4d] leading-[1.7] mb-12">
              Share your hiring requirements. Our AI sourcing engine and expert consultants will curate a shortlist of top-tier talent within 48 hours.
            </p>

            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                  <svg className="w-6 h-6 text-[#ed1a24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-black mb-2">Speed to Hire</h3>
                  <p className="text-[15px] text-[#66686d] leading-relaxed">We don&apos;t rely on job boards. Our AI actively sources passive candidates who are ready to move.</p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                  <svg className="w-6 h-6 text-[#ed1a24]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-black mb-2">Precision Quality</h3>
                  <p className="text-[15px] text-[#66686d] leading-relaxed">Every candidate is pre-vetted for technical depth and cultural fit before they reach your inbox.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-14 pt-10 border-t border-gray-200">
              <p className="text-[13px] font-bold text-[#8b8d92] uppercase tracking-wider mb-4">Direct Contact</p>
              <div className="flex items-center gap-4">
                <a href="mailto:hello@merito.ai" className="inline-flex items-center gap-2 text-[20px] font-bold text-black hover:text-[#ed1a24] transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  hello@merito.ai
                </a>
              </div>
              <p className="text-[14px] font-medium text-[#8b8d92] mt-2 ml-8">Response time: &lt; 24hr</p>
            </div>
          </div>

          {/* Right Column - Form Card */}
          <div className="relative w-full">
            {/* Form Shadow / Backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#ed1a24]/10 to-transparent blur-2xl rounded-full opacity-60" />
            
            <div className="relative bg-white rounded-[28px] shadow-[0_20px_80px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
              <div className="p-8 sm:p-10">
                <h2 className="font-[family-name:var(--font-gabarito)] text-[32px] font-bold text-black mb-2">Request a consultation</h2>
                <p className="text-[#66686d] text-[15px] mb-8">Fill out the form below and we&apos;ll be in touch shortly.</p>
                <ContactForm />
              </div>
              {/* Decorative bottom line */}
              <div className="h-2 w-full bg-[linear-gradient(90deg,#ed1a24_0%,#000000_100%)]" />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
