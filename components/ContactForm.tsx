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
        className="bg-white p-10 rounded-[20px] shadow-[0_20px_50px_rgba(237,26,36,0.08)] border border-[#f3d8d9] text-center"
      >
        <div className="size-16 bg-[#ed1a24] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="size-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-gabarito)] text-[28px] font-bold text-black mb-3">Message Received!</h3>
        <p className="text-[#4b4b4d] text-[17px]">Our expert team will get back to you within 24 hours.</p>
        <button 
          onClick={() => setStatus("idle")}
          className="mt-8 text-[#ed1a24] font-semibold hover:underline"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white p-8 sm:p-10 rounded-[24px] shadow-[0_22px_60px_rgba(17,35,89,0.08)] border border-black/5"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label htmlFor="name" className="text-[14px] font-bold text-black uppercase tracking-wider">Full Name</label>
            <input 
              required
              id="name"
              type="text" 
              placeholder="John Doe"
              className="w-full h-[56px] px-5 rounded-[12px] border border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2 text-left">
            <label htmlFor="email" className="text-[14px] font-bold text-black uppercase tracking-wider">Email Address</label>
            <input 
              required
              id="email"
              type="email" 
              placeholder="john@company.com"
              className="w-full h-[56px] px-5 rounded-[12px] border border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label htmlFor="company" className="text-[14px] font-bold text-black uppercase tracking-wider">Company</label>
            <input 
              id="company"
              type="text" 
              placeholder="Company Name"
              className="w-full h-[56px] px-5 rounded-[12px] border border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium"
            />
          </div>
          <div className="space-y-2 text-left">
            <label htmlFor="role" className="text-[14px] font-bold text-black uppercase tracking-wider">Role Interested In</label>
            <select 
              id="role"
              className="w-full h-[56px] px-5 rounded-[12px] border border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium appearance-none"
            >
              <option value="tech">Tech / Engineering</option>
              <option value="product">Product Management</option>
              <option value="sales">Sales / Growth</option>
              <option value="leadership">Executive / Leadership</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label htmlFor="message" className="text-[14px] font-bold text-black uppercase tracking-wider">Tell us your requirements</label>
          <textarea 
            required
            id="message"
            rows={4}
            placeholder="How can we help you scale?"
            className="w-full p-5 rounded-[12px] border border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white focus:border-[#ed1a24] focus:ring-1 focus:ring-[#ed1a24] outline-none transition-all font-medium resize-none"
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={status === "submitting"}
          className="w-full h-[60px] bg-[#ed1a24] text-white rounded-[12px] font-bold text-[18px] hover:bg-[#c8151e] transition-all shadow-[0_12px_30px_rgba(237,26,36,0.22)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Sending..." : "Submit Requirements"}
        </button>
      </form>
    </motion.div>
  );
}
