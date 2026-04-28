"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ScanBars({
  widths,
  className,
  barClassName,
}: {
  widths: number[];
  className?: string;
  barClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {widths.map((w, i) => (
        <div
          key={i}
          className={`relative overflow-hidden ${barClassName ?? ""}`}
          style={{ width: `${w * 100}%` }}
        >
          {!reduce && (
            <motion.span
              className="absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]"
              animate={{ x: ["0%", "400%"] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.25,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function FillBars({
  widths,
  className,
  trackClassName,
  fillClassName,
}: {
  widths: number[];
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {widths.map((w, i) => (
        <div key={i}>
          <div className={`mb-2 h-2 rounded-full ${trackClassName ?? ""}`} />
          <motion.div
            className={`h-3 rounded-full ${fillClassName ?? ""}`}
            variants={{
              hidden: { width: 0 },
              show: {
                width: `${w * 100}%`,
                transition: { duration: 1.1, ease: EASE },
              },
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}

export function Waveform({
  count = 18,
  className,
  barClassName,
}: {
  count?: number;
  className?: string;
  barClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => {
        const phase = i / count;
        return (
          <motion.span
            key={i}
            className={barClassName}
            style={{ originY: 0.5 }}
            animate={
              reduce
                ? undefined
                : {
                    scaleY: [0.3, 1, 0.5, 0.85, 0.3],
                  }
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: phase * 0.6,
            }}
          />
        );
      })}
    </div>
  );
}

export function TypingDots({
  className,
  dotClassName,
}: {
  className?: string;
  dotClassName?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={className}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={dotClassName}
          animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

export function LiveTimer({
  startSec = 154,
  className,
}: {
  startSec?: number;
  className?: string;
}) {
  const [sec, setSec] = useState(startSec);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [reduce]);

  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const out = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return <span className={className}>{out}</span>;
}
