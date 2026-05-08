"use client";

import { useState } from "react";
import Image from "next/image";

type Tab = "company" | "candidate";

const tabs: { id: Tab; title: string; desc: string; icon: string }[] = [
  {
    id: "company",
    title: "Company",
    desc: "Track and improve your reputation in the job market",
    icon: "/offervault/icon-company.svg",
  },
  {
    id: "candidate",
    title: "Candidate",
    desc: "Make confident career moves with transparency",
    icon: "/offervault/icon-candidate.svg",
  },
];

const impacts: Record<Tab, { title: string; rows: { icon: string; label: string }[] }> = {
  company: {
    title: "What impacts company's",
    rows: [
      {
        icon: "/offervault/icon-impact-1.svg",
        label: "Delay in the joining date",
      },
      {
        icon: "/offervault/icon-impact-2.svg",
        label: "Deviation in offered & actual salary",
      },
    ],
  },
  candidate: {
    title: "What impacts candidate's",
    rows: [
      {
        icon: "/offervault/icon-impact-1.svg",
        label: "Delay in the joining date",
      },
      {
        icon: "/offervault/icon-impact-2.svg",
        label: "Failure to join after accepting offer",
      },
    ],
  },
};

export default function ReputationToggle() {
  const [active, setActive] = useState<Tab>("company");
  const data = impacts[active];

  return (
    <div className="bg-[#fef8f6] p-[16px] sm:p-[75px] rounded-[8px] sm:rounded-[15px] flex flex-col sm:flex-row gap-[12px] sm:gap-[48px] sm:items-center">
      {/* Left: Toggle cards */}
      <div className="flex flex-row sm:flex-col gap-[12px] sm:gap-[50px] sm:w-[513px]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`text-left rounded-[2px] sm:rounded-[7px] shadow-[0px_1.2px_0.6px_rgba(0,0,0,0.25)] sm:shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex gap-[7px] sm:gap-[24px] items-center px-[9px] sm:px-[28px] py-[7px] sm:py-[23px] transition-colors flex-1 sm:flex-none ${
                isActive
                  ? "bg-[#fef0ee] border-l-[2.5px] sm:border-l-8 border-[#f31921]"
                  : "bg-white border-l-[2.5px] sm:border-l-8 border-transparent hover:bg-[#fafafa]"
              }`}
            >
              {isActive ? (
                <div className="size-[20px] sm:size-[65px] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image src={tab.icon} alt={tab.title} width={65} height={65} unoptimized className="w-full h-full" />
                </div>
              ) : (
                <div className="size-[20px] sm:size-[65px] bg-[#e2e2e2] rounded-full shadow-[0px_0px_1.5px_0.3px_rgba(0,0,0,0.25)] sm:shadow-[0px_0px_5px_1px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image src={tab.icon} alt={tab.title} width={40} height={40} unoptimized className="w-[14px] h-[14px] sm:w-[40px] sm:h-[40px]" />
                </div>
              )}
              <div className="flex flex-col gap-1 sm:gap-3">
                <h3
                  className={`font-[family-name:var(--font-poppins)] font-semibold text-[12px] sm:text-[24px] italic sm:not-italic ${
                    isActive ? "text-[#f31921]" : "text-black"
                  }`}
                >
                  {tab.title}
                </h3>
                <p className="text-[8px] sm:text-[16px] text-[#555] leading-[155%]">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: Impact card */}
      <div className="bg-[#fefbfb] drop-shadow-[0px_1.2px_1.2px_rgba(0,0,0,0.1)] sm:drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[5px] sm:rounded-[12px] px-[16px] sm:px-[62px] py-[16px] sm:py-[42px] flex flex-col gap-[12px] sm:gap-[23px] flex-1">
        <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[12px] sm:text-[32px] text-black leading-[134%]">
          {data.title}{" "}
          <span className="text-[#f31921]">reputation index</span>
        </h3>
        {data.rows.map((row, i) => (
          <div key={row.label + i} className="flex items-center gap-[10px] sm:gap-[43px]">
            {i === 0 ? (
              <div className="size-[25px] sm:size-[63px] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image src={row.icon} alt={row.label} width={63} height={63} unoptimized className="w-full h-full" />
              </div>
            ) : (
              <div className="size-[25px] sm:size-[63px] rounded-full bg-[#fef0ee] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image src={row.icon} alt={row.label} width={39} height={39} unoptimized className="w-[17px] h-[17px] sm:w-[39px] sm:h-[39px]" />
              </div>
            )}
            <p className="font-[family-name:var(--font-poppins)] font-semibold text-[10px] sm:text-[16px] text-black">
              {row.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
