"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  name: string;
  description: string;
}

export default function VideoPlayer({ src, name, description }: VideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      {/* Trigger Card */}
      <article 
        onClick={() => setIsOpen(true)}
        className="relative min-h-[460px] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#1a1a1a_0%,#0a0a0a_100%)] shadow-[0_22px_60px_rgba(17,35,89,0.1)] cursor-pointer group"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <button
            aria-label="Play testimonial"
            className="inline-flex size-[84px] items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all duration-300 group-hover:bg-[#ed1a24] group-hover:scale-110 shadow-2xl"
          >
            <span className="ml-1 inline-block border-y-[14px] border-y-transparent border-l-[22px] border-l-white" />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 size-[220px] rounded-full bg-[#ed1a24]/15 blur-[60px] group-hover:bg-[#ed1a24]/25 transition-colors duration-500" />
        <div className="absolute -bottom-20 -left-16 size-[260px] rounded-full bg-[#ed1a24]/12 blur-[60px] group-hover:bg-[#ed1a24]/20 transition-colors duration-500" />
        
        {/* Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.85))] px-7 pb-7 pt-24 z-10">
          <p className="text-[24px] font-bold text-white tracking-tight">{name}</p>
          <p className="mt-1 text-[16px] text-white/70 font-medium">{description}</p>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="h-[2px] w-12 bg-[#ed1a24]" />
            <span className="text-[12px] font-bold text-white/50 uppercase tracking-[0.1em]">Watch Video</span>
          </div>
        </div>
        
        {/* Hover Gradient Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </article>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(237,26,36,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-[110] size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-md"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              <video
                ref={videoRef}
                src={src}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
              
              {/* Bottom Label in Modal */}
              <div className="absolute bottom-6 left-6 z-[110] pointer-events-none">
                <p className="text-white font-bold text-xl drop-shadow-lg">{name}</p>
                <p className="text-white/70 text-sm drop-shadow-md">{description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
