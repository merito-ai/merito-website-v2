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
    <div className="bg-[#fef8f6] p-[75px] rounded-[15px] flex gap-[48px] items-center">
      {/* Left: Toggle cards */}
      <div className="flex flex-col gap-[50px] w-[513px]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`text-left rounded-[7px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex gap-[24px] items-center px-[28px] py-[23px] transition-colors ${
                isActive
                  ? "bg-[#fef0ee] border-l-8 border-[#f31921]"
                  : "bg-white border-l-8 border-transparent hover:bg-[#fafafa]"
              }`}
            >
              {isActive ? (
                <div className="size-[65px] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image src={tab.icon} alt={tab.title} width={65} height={65} unoptimized />
                </div>
              ) : (
                <div className="size-[65px] bg-[#e2e2e2] rounded-full shadow-[0px_0px_5px_1px_rgba(0,0,0,0.25)] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <Image src={tab.icon} alt={tab.title} width={40} height={40} unoptimized />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <h3
                  className={`font-[family-name:var(--font-poppins)] font-semibold text-[24px] ${
                    isActive ? "text-[#f31921]" : "text-black"
                  }`}
                >
                  {tab.title}
                </h3>
                <p className="text-[16px] text-[#555] leading-[155%]">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: Impact card */}
      <div className="bg-[#fefbfb] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[12px] px-[62px] py-[42px] flex flex-col gap-[23px] flex-1">
        <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black leading-[134%]">
          {data.title}{" "}
          <span className="text-[#f31921]">reputation index</span>
        </h3>
        {data.rows.map((row, i) => (
          <div key={row.label + i} className="flex items-center gap-[43px]">
            {i === 0 ? (
              <div className="size-[63px] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image src={row.icon} alt={row.label} width={63} height={63} unoptimized />
              </div>
            ) : (
              <div className="size-[63px] rounded-full bg-[#fef0ee] flex items-center justify-center overflow-hidden flex-shrink-0">
                <Image src={row.icon} alt={row.label} width={39} height={39} unoptimized />
              </div>
            )}
            <p className="font-[family-name:var(--font-poppins)] font-semibold text-[16px] text-black">
              {row.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
