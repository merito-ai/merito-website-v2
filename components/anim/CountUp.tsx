"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  formatter?: (n: number) => string;
};

export default function CountUp({
  value,
  suffix = "",
  prefix = "",
  duration = 1.4,
  className,
  formatter,
}: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    
    const controls = animate(mv, value, {
      duration: reduce ? 0 : duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration, mv, reduce]);

  const out = formatter
    ? formatter(display)
    : Number.isInteger(value)
    ? Math.round(display).toString()
    : display.toFixed(1);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {out}
      {suffix}
    </span>
  );
}
