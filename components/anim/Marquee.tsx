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
    <div className="relative mt-6 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
      <motion.div
        className="flex w-max items-stretch gap-5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ willChange: "transform" }}
        whileHover={{ animationPlayState: "paused" } as never}
      >
        {/* strip 1 */}
        <div className="flex shrink-0 items-stretch gap-5 pr-5">
          {children}
        </div>
        {/* strip 2 — exact duplicate so loop is seamless */}
        <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
