"use client";

import { motion, useAnimationControls } from "motion/react";
import type { ReactNode } from "react";

export default function Marquee({
  children,
  speed = 40,
}: {
  children: ReactNode;
  speed?: number;
}) {
  const controls1 = useAnimationControls();
  const controls2 = useAnimationControls();

  const transition = { ease: "linear" as const, duration: speed, repeat: Infinity };

  function pause() {
    controls1.stop();
    controls2.stop();
  }

  function resume() {
    controls1.start({ x: [null, "-100%"], transition });
    controls2.start({ x: [null, "-100%"], transition });
  }

  return (
    <div
      className="relative mt-6 flex w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <motion.div
        className="flex min-w-full shrink-0 items-stretch gap-5 pr-5"
        animate={controls1}
        initial={{ x: "0%" }}
        onViewportEnter={() => controls1.start({ x: [null, "-100%"], transition })}
      >
        {children}
      </motion.div>
      <motion.div
        className="flex min-w-full shrink-0 items-stretch gap-5 pr-5"
        animate={controls2}
        initial={{ x: "0%" }}
        onViewportEnter={() => controls2.start({ x: [null, "-100%"], transition })}
        aria-hidden="true"
      >
        {children}
      </motion.div>
    </div>
  );
}
