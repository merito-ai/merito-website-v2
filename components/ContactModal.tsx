"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useContactModal } from "@/context/ContactModalContext";
import ContactForm from "./ContactForm";

export default function ContactModal() {
  const { isOpen, closeContact } = useContactModal();

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContact();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeContact]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeContact}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[580px] bg-white rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-2 flex items-start justify-between">
              <div>
                <h2 className="font-[family-name:var(--font-gabarito)] text-[32px] font-bold text-black leading-tight">
                  Start Hiring <span className="text-[#ed1a24]">Smarter.</span>
                </h2>
                <p className="mt-2 text-[#4b4b4d] text-[15px] font-medium">
                  Share your requirements and we&apos;ll get back within 24hr.
                </p>
              </div>
              <button 
                onClick={closeContact}
                className="size-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form Body (Scrollable if needed) */}
            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <ContactForm />
            </div>

            {/* Footer decoration */}
            <div className="h-2 w-full bg-[linear-gradient(90deg,#ed1a24_0%,#000000_100%)]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
