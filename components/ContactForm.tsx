"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Script from "next/script";

declare global {
  interface Window {
    grecaptcha?: {
      getResponse: () => string;
      reset: () => void;
    };
  }
}

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const recaptchaEnabled = Boolean(recaptchaSiteKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setCaptchaError(null);
    setFormError(null);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue>;

    if (recaptchaEnabled) {
      const recaptchaToken = window.grecaptcha?.getResponse?.() || "";
      if (!recaptchaToken) {
        setStatus("idle");
        setCaptchaError("Please verify that you are not a robot.");
        return;
      }
      payload.recaptchaToken = recaptchaToken;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        form.reset();
        window.grecaptcha?.reset?.();
        setStatus("success");
      } else {
        let errMsg = "Something went wrong. Please try again.";
        try {
          const data = await res.json() as { error?: string };
          if (data.error) errMsg = data.error;
        } catch { /* ignore parse error */ }
        window.grecaptcha?.reset?.();
        setCaptchaError(null);
        setFormError(errMsg);
        setStatus("idle");
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10"
      >
        <div className="size-20 bg-[#ed1a24] rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_12px_40px_rgba(237,26,36,0.3)]">
          <svg className="size-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-gabarito)] text-[32px] font-bold text-black mb-4">Message Received!</h3>
        <p className="text-[#4b4b4d] text-[18px] leading-relaxed max-w-[320px] mx-auto">Our expert team will get back to you within 24 hours.</p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {recaptchaEnabled ? (
        <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
      ) : null}

      <input type="text" name="bot-field" className="hidden" aria-hidden="true" />

      {/* Name Fields (Split) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="flex items-center gap-2 text-[13px] font-bold text-black uppercase tracking-widest">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            First Name
          </label>
          <input
            required
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Aarav"
            className="w-full h-[52px] px-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium text-[15px]"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-[13px] font-bold text-black uppercase tracking-widest pt-6 sm:pt-0">
            Last Name
          </label>
          <input
            required
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Sharma"
            className="w-full h-[52px] px-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium text-[15px]"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="flex items-center gap-2 text-[13px] font-bold text-black uppercase tracking-widest">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
          Email Address
        </label>
        <input
          required
          id="email"
          name="email"
          type="email"
          placeholder="aarav@company.in"
          className="w-full h-[52px] px-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium text-[15px]"
        />
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <label htmlFor="phone" className="flex items-center gap-2 text-[13px] font-bold text-black uppercase tracking-widest">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+91 98765 43210"
          className="w-full h-[52px] px-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium text-[15px]"
        />
      </div>

      {/* Departments Field */}
      <div className="space-y-2">
        <label htmlFor="departments" className="flex items-center gap-2 text-[13px] font-bold text-black uppercase tracking-widest">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Departments<span className="text-[#ed1a24]">*</span>
        </label>
        <input
          required
          id="departments"
          name="departments"
          type="text"
          placeholder="e.g. Technology, Sales"
          className="w-full h-[52px] px-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium text-[15px]"
        />
      </div>

      {/* Message Field (Bottom) */}
      <div className="space-y-2">
        <label htmlFor="message" className="flex items-center gap-2 text-[13px] font-bold text-black uppercase tracking-widest">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Message<span className="text-[#ed1a24]">*</span>
        </label>
        <textarea
          required
          id="message"
          name="message"
          rows={3}
          placeholder="How can we help you scale?"
          className="w-full p-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium resize-none text-[15px]"
        ></textarea>
      </div>

      {recaptchaEnabled ? (
        <div className="space-y-2">
          {/* Scale down the fixed-300px widget on narrow phones */}
          <div className="origin-top-left scale-[0.82] sm:scale-100 w-[246px] sm:w-[304px] overflow-hidden">
            <div className="g-recaptcha" data-sitekey={recaptchaSiteKey} />
          </div>
          {captchaError ? <p className="text-[13px] font-semibold text-[#ed1a24]">{captchaError}</p> : null}
        </div>
      ) : null}

      {formError ? (
        <div className="flex items-start gap-3 rounded-[10px] bg-[#fef2f2] border border-[#fecaca] px-4 py-3">
          <svg className="size-4 text-[#ed1a24] mt-[2px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-[13px] font-semibold text-[#ed1a24] leading-snug">{formError}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full h-[60px] mt-4 bg-[#ed1a24] text-white rounded-[12px] font-bold text-[18px] transition-all duration-200 hover:bg-black hover:text-white hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Submit Requirements"}
      </button>
    </form>
  );
}
