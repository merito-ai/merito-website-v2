"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

export type CarouselItem = {
  quote: string;
  name: string;
  role: string;
  color: string;
  initials: string;
};

type Props = {
  items: CarouselItem[];
  intervalMs?: number;
  className?: string;
};

export default function TestimonialCarousel({
  items,
  intervalMs = 7000,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const total = items.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + total) % total),
    [total]
  );

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [next, intervalMs, reduce]);

  const current = items[index];

  return (
    <article
      className={`relative overflow-hidden rounded-[22px] border border-black/8 bg-white p-8 shadow-[0_22px_60px_rgba(17,35,89,0.06)] ${className}`}
    >
      <div className="min-h-[260px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <blockquote className="max-w-[500px] text-[22px] font-medium italic leading-[1.55] text-[#444]">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div className="mt-8 flex items-center gap-4">
              <span
                className={`inline-flex size-12 items-center justify-center rounded-full text-[14px] font-semibold text-white ${current.color}`}
              >
                {current.initials}
              </span>
              <div>
                <p className="text-[18px] font-semibold text-black">
                  {current.name}
                </p>
                <p className="text-[15px] text-[#5f5f61]">{current.role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {total > 1 && (
        <div className="mt-8 flex items-center justify-between border-t border-black/8 pt-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="inline-flex size-9 items-center justify-center rounded-full border border-black/10 text-black transition-colors hover:bg-black hover:text-white"
            >
              &lt;
            </button>
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === index
                    ? "h-[6px] w-7 bg-black"
                    : "size-[6px] bg-black/15 hover:bg-black/40"
                }`}
              />
            ))}
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="inline-flex size-9 items-center justify-center rounded-full border border-black/10 text-black transition-colors hover:bg-black hover:text-white"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
