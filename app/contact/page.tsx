import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Merito — Start Hiring Smarter",
  description: "Talk to a Merito expert. Share your talent requirements and get a curated shortlist within 5–7 days.",
};
"use client";

import { useState } from "react";
import Image from "next/image";

const contactInfo = [
  {
    icon: "https://www.figma.com/api/mcp/asset/d0140a3a-ba13-4347-a2a0-44ab059e4549",
    label: "Email",
    value: "admin@merito.ai",
    href: "mailto:admin@merito.ai",
  },
  {
    icon: "https://www.figma.com/api/mcp/asset/eca2d5e3-b192-4694-9173-94318338d4d5",
    label: "Phone",
    value: "+91 97676-63123",
    href: "tel:+919767663123",
  },
];

const services = [
  "Recruitment Services",
  "AI Consulting",
  "Offer Vault",
  "Ref-Track",
  "ICE Assessment",
  "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    message: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="bg-[#fdf8fb]">
      {/* Hero */}
      <section className="relative mx-auto max-w-[1300px] px-5 pt-8">
        <div className="relative h-[280px] rounded-[11px] overflow-hidden bg-gradient-to-br from-black via-[#1a1a1a] to-[#2d0a0c] flex flex-col items-center justify-center text-center gap-4 px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[48px] text-white leading-normal">
              Let&apos;s <span className="text-[#ed1a24]">Talk</span>
            </h1>
            <p className="font-medium text-[20px] text-[#d9d9d9] leading-[165%] max-w-[600px]">
              Tell us what you need. Our team will get back within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact layout */}
      <section className="max-w-[1200px] mx-auto px-5 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-start">
          {/* Left: info */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black">
                Get in Touch
              </h2>
              <p className="text-[16px] text-[#4b4b4d] leading-[165%]">
                Whether you&apos;re looking to hire exceptional talent, explore our AI recruitment tools,
                or just want to understand how Merito can help your business — we&apos;re here to help.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {contactInfo.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="flex items-center gap-5 group"
                >
                  <div className="size-[52px] bg-[#ed1a24]/10 rounded-[10px] flex items-center justify-center flex-shrink-0">
                    <Image src={c.icon} alt={c.label} width={26} height={26} unoptimized />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-[#ed1a24] tracking-wider uppercase">{c.label}</span>
                    <span className="font-[family-name:var(--font-poppins)] font-medium text-[16px] text-black group-hover:text-[#ed1a24] transition-colors">
                      {c.value}
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <div className="bg-black rounded-[16px] p-8 flex flex-col gap-4">
              <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] text-white">
                Why companies choose Merito
              </h3>
              <ul className="flex flex-col gap-3">
                {[
                  "48-hour sourcing — faster than any traditional agency",
                  "Top 2% talent curated through AI + human review",
                  "85% offer acceptance rate across all placements",
                  "Dedicated account manager from day one",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[14px] text-white/80">
                    <span className="size-[8px] rounded-full bg-[#ed1a24] flex-shrink-0 mt-[6px]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-[20px] shadow-[0px_4px_24px_rgba(0,0,0,0.08)] p-[48px]">
            {submitted ? (
              <div className="flex flex-col items-center gap-5 text-center py-8">
                <div className="size-[72px] rounded-full bg-[#ed1a24]/10 flex items-center justify-center text-[36px]">
                  ✓
                </div>
                <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[24px] text-black">
                  Message sent!
                </h3>
                <p className="text-[16px] text-[#4b4b4d] leading-[155%]">
                  Thanks for reaching out. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-black">Your Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Tell us about your hiring needs..."
                    className="px-4 py-3 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-[#fafafa] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-black">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="John"
                      className="h-[48px] px-4 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-[#fafafa]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-semibold text-black">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Smith"
                      className="h-[48px] px-4 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-[#fafafa]"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-black">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="h-[48px] px-4 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-[#fafafa]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-black">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="h-[48px] px-4 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-[#fafafa]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-black">Departments</label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="h-[48px] px-4 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-[#fafafa] appearance-none"
                  >
                    <option value="">Select a department</option>
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[16px] h-[52px] rounded-[8px] hover:bg-[#c8151e] transition-colors mt-2"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
