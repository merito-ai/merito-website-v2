"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  heights: number[];
  className?: string;
  barClassName?: string;
  duration?: number;
  stagger?: number;
};

export default function GrowBars({
  heights,
  className,
  barClassName,
  duration = 0.7,
  stagger = 0.06,
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {heights.map((h, i) => (
        <motion.span
          key={i}
          className={barClassName}
          style={{ height: h, originY: 1 }}
          variants={{
            hidden: { scaleY: 0, opacity: 0 },
            show: {
              scaleY: 1,
              opacity: 1,
              transition: { duration, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        />
      ))}
    </motion.div>
  );
}
