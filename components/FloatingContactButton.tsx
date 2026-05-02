"use client";

import { useContactModal } from "@/context/ContactModalContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function FloatingContactButton() {
  const { openContact } = useContactModal();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Optional: Only show after scrolling down a bit
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        >
          <button
            onClick={openContact}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#ed1a24] text-white shadow-[0_8px_30px_rgba(237,26,36,0.3)] transition-transform hover:scale-110 active:scale-95"
            aria-label="Contact Us"
          >
            {/* Tooltip */}
            <span className="absolute right-[calc(100%+16px)] top-1/2 -translate-y-1/2 scale-0 rounded-[8px] bg-black px-4 py-2 font-[family-name:var(--font-poppins)] text-[14px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100 origin-right">
              Talk to an expert
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-black" />
            </span>
            
            {/* Chat Icon */}
            <svg
              className="size-6 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
