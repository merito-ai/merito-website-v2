"use client";

import { useState } from "react";
import { motion } from "motion/react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
    }, 1500);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Message Field (Top) */}
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
          rows={3}
          placeholder="How can we help you scale?"
          className="w-full p-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium resize-none text-[15px]"
        ></textarea>
      </div>

      {/* Name Fields (Split) */}
      <div className="grid grid-cols-2 gap-4">
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
            type="text" 
            placeholder="John"
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
            type="text" 
            placeholder="Doe"
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
          type="email" 
          placeholder="john@company.com"
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
          type="tel" 
          placeholder="+1 (555) 000-0000"
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
          type="text" 
          placeholder="e.g. Technology, Sales"
          className="w-full h-[52px] px-4 rounded-[12px] border border-[#e5e7eb] bg-[#f9f9fb] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium text-[15px]"
        />
      </div>

      <button 
        type="submit"
        disabled={status === "submitting"}
        className="w-full h-[60px] mt-4 bg-[#ed1a24] text-white rounded-[12px] font-bold text-[18px] hover:bg-[#c8151e] transition-all shadow-[0_12px_30px_rgba(237,26,36,0.22)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Submit Requirements"}
      </button>
    </form>
  );
}
