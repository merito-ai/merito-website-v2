"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export default function Marquee({
  children,
  speed = 40,
}: {
  children: ReactNode;
  speed?: number;
}) {
  return (
    <div className="relative mt-6 flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
      <motion.div
        className="flex min-w-full shrink-0 items-stretch gap-5 pr-5"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex min-w-full shrink-0 items-stretch gap-5 pr-5"
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          ease: "linear",
          duration: speed,
          repeat: Infinity,
        }}
        aria-hidden="true"
      >
        {children}
      </motion.div>
    </div>
  );
}
