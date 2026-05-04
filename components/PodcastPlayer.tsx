"use client";
import { useRef, useState, useEffect } from "react";

const WAVE_BARS = [4,9,6,14,8,18,5,12,20,7,15,10,19,5,13,8,16,6,20,9,14,7,11,17,5,10,15,8,18,6,13,9,16,7,14,10,19,5,11,8];

interface PodcastPlayerProps {
  audioSrc: string | null;
  episode: string;
  date?: string;
  title: string;
  duration: string;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({ audioSrc, episode, date, title, duration }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    const onLoaded = () => setAudioDuration(el.duration);
    const onEnded = () => setIsPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) { el.pause(); setIsPlaying(false); }
    else { el.play(); setIsPlaying(true); }
  };

  const seekFromWaveform = (e: React.MouseEvent<SVGSVGElement>) => {
    const el = audioRef.current;
    if (!el || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
  };

  const progress = audioDuration ? currentTime / audioDuration : 0;
  const displayDuration = audioDuration ? formatTime(audioDuration) : duration;

  return (
    <div className="md:w-[55%] bg-[#ed1a24] p-10 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
      <style>{`
        @keyframes bar-pulse {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* Depth layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-[80px]" />

      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 text-[11px] font-bold tracking-[4px] text-white/50 uppercase">
          <span>{episode}</span>
          {date && <><span className="w-1 h-1 rounded-full bg-white/40" /><span>{date}</span></>}
        </div>
        <h2 className="font-[family-name:var(--font-gabarito)] font-bold text-[30px] md:text-[36px] mt-4 leading-[1.1] tracking-tight">
          {title}
        </h2>
        <p className="mt-3 text-white/55 text-[14px] leading-relaxed max-w-[360px]">
          Merito on talent, technology, and human intelligence.
        </p>
      </div>

      {/* Player */}
      <div className="relative z-10 mt-10 flex flex-col gap-5">

        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Equalizer bars */}
            <span className="flex items-end gap-[2px] h-3.5">
              {[0.6, 1, 0.7].map((delay, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    height: i === 1 ? "14px" : "9px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    transformOrigin: "bottom",
                    animation: isPlaying
                      ? `bar-pulse ${0.55 + i * 0.1}s ease-in-out ${delay * 0.1}s infinite`
                      : "none",
                    transform: isPlaying ? undefined : "scaleY(0.35)",
                  }}
                />
              ))}
            </span>
            <span className="text-[11px] font-bold tracking-[3px] text-white/50 uppercase">
              {isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/30 mx-0.5">/</span>
            <span className="text-white/50">{displayDuration}</span>
          </div>
        </div>

        {/* Waveform */}
        <svg
          viewBox={`0 0 ${WAVE_BARS.length * 6} 24`}
          className="w-full h-8 cursor-pointer"
          onClick={seekFromWaveform}
          preserveAspectRatio="none"
          aria-label="Seek audio"
        >
          {WAVE_BARS.map((h, i) => (
            <rect
              key={i}
              x={i * 6}
              y={(24 - h) / 2}
              width={3.5}
              height={h}
              rx={2}
              fill={
                i / WAVE_BARS.length <= progress
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,255,255,0.18)"
              }
            />
          ))}
          {/* Playhead dot */}
          {audioDuration > 0 && (
            <circle
              cx={progress * WAVE_BARS.length * 6}
              cy={12}
              r={3}
              fill="white"
            />
          )}
        </svg>

        {/* Play button row */}
        <div className="flex items-center gap-5 pt-1">
          <button
            onClick={toggle}
            disabled={!audioSrc}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="relative flex-shrink-0 disabled:opacity-40"
          >
            {isPlaying && (
              <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
            )}
            <span className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-transform hover:scale-105 active:scale-95 block">
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ed1a24">
                  <rect x="5" y="4" width="4" height="16" rx="1.5" />
                  <rect x="15" y="4" width="4" height="16" rx="1.5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#ed1a24" style={{ marginLeft: "2px" }}>
                  <polygon points="5,3 20,12 5,21" />
                </svg>
              )}
            </span>
          </button>
          <p className="text-[12px] text-white/40 leading-snug font-medium">
            Free to listen.<br />No Spotify needed.
          </p>
        </div>
      </div>
    </div>
  );
}
