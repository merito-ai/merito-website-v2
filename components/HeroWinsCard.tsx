"use client";

import { useEffect, useState } from "react";

type Tab = {
  key: string;
  label: string;
  value: string;
  description: string;
  chips: string[];
};

const TABS: Tab[] = [
  {
    key: "sourcing",
    label: "Sourcing Speed",
    value: "48 Hours",
    description:
      "Our AI Stack achieve top 2% talent replaces 60+ hours of manual sourcing",
    chips: ["Top\n2% Talent", "60+ Hours\nSaved", "10+ Industries\nserved"],
  },
  {
    key: "time",
    label: "Time to hire",
    value: "60% Faster",
    description:
      "Our AI Stack achieve top 2% talent replaces 60+ hours of manual sourcing",
    chips: ["90%\nSuccess Rate", "85% Retention\n2 years", "18X\nBetter Hiring"],
  },
  {
    key: "placements",
    label: "Placements",
    value: "1000+",
    description:
      "Our AI Stack achieve top 2% talent replaces 60+ hours of manual sourcing",
    chips: ["80% Offer to\nJoin rate", "360*\nReferences", "6 Years\nConsistency"],
  },
  {
    key: "success",
    label: "Success Rate",
    value: "90%",
    description:
      "Our AI Stack achieve top 2% talent replaces 60+ hours of manual sourcing",
    chips: ["50+\nHappy clients", "10+ Industries\nserved", "20+\nYears"],
  },
];

const CYCLE_MS = 6000;
const TICK_MS = 50;

export default function HeroWinsCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => setProgress(0));
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / CYCLE_MS) * 100);
      setProgress(pct);
      if (elapsed >= CYCLE_MS) {
        setActiveIndex((i) => (i + 1) % TABS.length);
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const active = TABS[activeIndex];

  return (
    <div className="relative mx-auto w-full max-w-[593px] lg:pt-10">
      <div className="relative flex min-h-[280px] sm:min-h-[360px] flex-col rounded-[15px] sm:rounded-[18px] border border-[#ed1a24]/15 bg-white p-3 sm:p-5 shadow-[0_24px_80px_rgba(17,35,89,0.08)]">
        <div className="absolute -top-3 sm:-top-4 right-4 sm:right-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#ed1a24] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[12px] font-semibold text-white shadow-[0_10px_24px_rgba(237,26,36,0.25)]">
            <span className="size-2 rounded-full bg-white/85" />
            Recent wins at Merito.ai
          </span>
        </div>

        <div className="mt-3">
          <span className="inline-flex items-center whitespace-nowrap rounded-full bg-black px-4 py-2 text-[10px] sm:text-[12px] font-semibold text-white">
            {active.label}
          </span>
        </div>

        <div className="mt-auto">
          <div className="font-[family-name:var(--font-gabarito)] text-[2.75rem] sm:text-[4rem] font-semibold leading-none text-black">
            {active.value}
          </div>
          <p className="mt-2 sm:mt-3 max-w-[420px] text-[12px] sm:text-[14px] font-medium leading-[1.5] text-[#4b4b4d]">
            {active.description}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {active.chips.map((chip, i) => (
            <div
              key={`${active.key}-${i}`}
              className="whitespace-pre-line rounded-[10px] sm:rounded-[14px] border border-black/10 bg-[#f8f8fb] px-2 sm:px-3 py-2.5 sm:py-4 text-center text-[10px] sm:text-[14px] font-semibold leading-[1.3] text-black"
            >
              {chip}
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 h-[3px] sm:h-[4px] overflow-hidden rounded-full bg-[#ececec]">
          <div
            className="h-full rounded-full bg-[#ed1a24] transition-[width] duration-[50ms] ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
