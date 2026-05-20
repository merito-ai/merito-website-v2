"use client";

import { useRef, useState, useEffect } from "react";

type Props = {
  to: number;
  suffix?: string;
  duration?: number;
};

export default function RampCountUp({ to, suffix = "", duration = 1600 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setVal(to * eased);
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  const display = (() => {
    if (suffix === "K+") return Math.round(val);
    if (to >= 100) return Math.round(val);
    if (Number.isInteger(to)) return Math.round(val);
    return val.toFixed(1);
  })();

  return (
    <span ref={ref}>
      {display}
      <span style={{ color: "#ed1a24" }}>{suffix}</span>
    </span>
  );
}
