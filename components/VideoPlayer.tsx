"use client";
import { useState, useRef } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  name: string;
  description: string;
}

export default function VideoPlayer({ src, poster, name, description }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <article 
      className="relative min-h-[460px] h-full overflow-hidden rounded-[22px] bg-black shadow-[0_22px_60px_rgba(17,35,89,0.1)] group"
    >
      {!isPlaying ? (
        <div 
          className="relative h-full w-full cursor-pointer"
          onClick={handlePlay}
        >
          {/* Thumbnail/Poster Background */}
          {poster && (
            <Image
              src={poster}
              alt={name}
              fill
              className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            />
          )}
          
          {/* Default Gradient if no poster */}
          {!poster && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#111111_0%,#1c1c1e_50%,#0a0a0a_100%)]" />
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
              />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ed1a24]" />
              <div className="absolute top-8 right-8 text-[120px] font-bold leading-none text-[#ed1a24] opacity-10 select-none font-[family-name:var(--font-gabarito)]">&ldquo;</div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#ed1a24] rounded-full blur-[100px] opacity-10" />
            </div>
          )}

          {/* Play Button */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-3">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Watch Testimonial</span>
            <button
              aria-label="Play testimonial"
              className="inline-flex size-[80px] items-center justify-center rounded-full bg-[#ed1a24] transition-transform duration-300 group-hover:scale-110 shadow-2xl"
            >
              <span className="ml-1 inline-block border-y-[14px] border-y-transparent border-l-[22px] border-l-white" />
            </button>
          </div>
          
          {/* Content Overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.95))] px-7 pb-8 pt-24 z-10">
            <p className="text-[26px] font-bold text-white tracking-tight leading-tight">{name}</p>
            <p className="mt-1 text-[17px] text-white/80 font-medium">{description}</p>
            
            <div className="mt-5 flex items-center gap-2">
              <div className="h-[2px] w-12 bg-[#ed1a24]" />
              <span className="text-[12px] font-bold text-white/60 uppercase tracking-[0.15em]">Watch Video</span>
            </div>
          </div>
          
          {/* Hover Shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      ) : (
        <div className="relative h-full w-full bg-black">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            autoPlay
            className="h-full w-full object-contain"
          />
          <button
            onClick={() => setIsPlaying(false)}
            aria-label="Close video"
            className="absolute top-4 right-4 z-20 size-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </article>
  );
}
