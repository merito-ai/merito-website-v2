"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
};

export function StaggerGroup({
  children,
  className,
  stagger = 0.1,
  delayChildren = 0.05,
}: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-140px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  as?: "div" | "article" | "li";
};

export function StaggerItem({
  children,
  className,
  y = 20,
  duration = 0.65,
  as = "div",
}: ItemProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
