"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const WAVE_BARS = [4,9,6,14,8,18,5,12,20,7,15,10,19,5,13,8,16,6,20,9,14,7,11,17,5,10,15,8,18,6,13,9,16,7,14,10,19,5,11,8];

interface PodcastPlayerProps {
  audioSrc: string | null;
  episode: string;
  date?: string;
  title: string;
  duration: string;
  hostImage?: string;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({ audioSrc, episode, date, title, duration, hostImage }: PodcastPlayerProps) {
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

  const seekFromBar = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - rect.left) / rect.width) * audioDuration;
  };

  const progress = audioDuration ? currentTime / audioDuration : 0;
  const displayDuration = audioDuration ? formatTime(audioDuration) : duration;

  return (
    <>
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="metadata" />}
      <style>{`
        @keyframes bar-pulse {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>

      {/* ── MOBILE: Spotify-style full red card ── */}
      <div className="sm:hidden bg-[#ed1a24] rounded-[20px] overflow-hidden shadow-[0px_8px_40px_rgba(237,26,36,0.35)]">

        {/* Host photo with overlays */}
        <div className="relative h-[220px]">
          {hostImage && (
            <Image src={hostImage} alt="Rushikesh Humbe" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

          {/* Spotify icon — top right */}
          <div className="absolute top-3 right-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-label="Spotify">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>

          {/* Episode badge — top left */}
          <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-[3px]">
            <span className="text-white text-[9px] font-bold tracking-[2px] uppercase">{episode}</span>
          </div>

          {/* Show name — bottom left */}
          <div className="absolute bottom-4 left-4 text-white">
            <p className="font-bold text-[18px] leading-tight">All About Talent</p>
            <p className="text-[10px] text-white/70 tracking-[1.5px] uppercase mt-0.5">WITH RUSHIKESH HUMBE</p>
          </div>
        </div>

        {/* Large title */}
        <div className="px-5 pt-4">
          <h2 className="font-[family-name:var(--font-poppins)] font-bold text-white text-[20px] leading-[1.2]">{title}</h2>
        </div>

        {/* Date */}
        {date && (
          <p className="px-5 mt-1.5 text-white/60 text-[13px]">{date} · All About Talent</p>
        )}

        {/* Save on Spotify */}
        <div className="px-5 mt-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full border border-white/50 flex items-center justify-center text-white text-[13px] leading-none">+</span>
          <span className="text-white text-[13px] font-medium">Save on Spotify</span>
        </div>

        {/* Progress bar */}
        <div
          className="mx-5 mt-4 h-[3px] bg-white/25 rounded-full cursor-pointer"
          onClick={seekFromBar}
        >
          <div className="h-full bg-white rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Bottom: timestamp + play button */}
        <div className="px-5 py-5 flex items-center justify-between">
          <span className="text-white font-bold text-[14px] tabular-nums">{displayDuration}</span>
          <button
            onClick={toggle}
            disabled={!audioSrc}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] disabled:opacity-40 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ed1a24">
                <rect x="5" y="4" width="4" height="16" rx="1.5" />
                <rect x="15" y="4" width="4" height="16" rx="1.5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#ed1a24" style={{ marginLeft: "2px" }}>
                <polygon points="5,3 20,12 5,21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── DESKTOP: right-panel inside the white card layout ── */}
      <div className="hidden sm:flex sm:w-[55%] bg-[#ed1a24] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Depth layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-[80px]" />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 text-[11px] font-bold tracking-[4px] text-white/50 uppercase">
          <span>{episode}</span>
          {date && <><span className="w-1 h-1 rounded-full bg-white/40" /><span>{date}</span></>}
        </div>
        <h2 className="font-[family-name:var(--font-gabarito)] font-bold text-[22px] sm:text-[36px] mt-3 sm:mt-4 leading-[1.1] tracking-tight">
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
    </>
  );
}
