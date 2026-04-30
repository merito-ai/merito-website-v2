"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useContactModal } from "@/context/ContactModalContext";

function Eyebrow({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center bg-[#ed1a24] px-[12px] py-[6px] rounded-full">
      <span className="font-[family-name:var(--font-poppins)] font-bold text-[12px] md:text-[14px] tracking-wider text-white leading-none uppercase">
        {text}
      </span>
    </div>
  );
}

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const DocumentCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polyline points="9 15 11 17 15 13" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black/20">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8l-4 4 4 4" />
    <path d="M16 12H8" />
  </svg>
);

function FunnelBar({ label, value, targetWidth, color, delay, visible }: { label: string, value: string, targetWidth: number, color: string, delay: number, visible: boolean }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-end">
        <span className="text-[14px] md:text-[16px] text-[#4b4b4d] font-medium">{label}</span>
        <span className="font-[family-name:var(--font-poppins)] font-bold text-[20px] md:text-[24px] text-black">{value}</span>
      </div>
      <div className="h-[12px] w-full bg-black/5 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ 
            width: visible ? `${targetWidth}%` : '0%',
            transitionDelay: `${delay}ms`
          }}
        />
      </div>
    </div>
  );
}

const stats = [
  { prefix: "Top", value: "+2%", label: "of talent shortlisted" },
  { prefix: "1000", value: "+", label: "successful placements" },
  { prefix: "85", value: "%", label: "retention on critical hires" },
  { prefix: "60", value: "%", label: "lower time-to-hire" },
];

const pillars = [
  {
    icon: SparklesIcon,
    title: "AI Powered Precision",
    desc: "We screen and shortlist only the top 2% of talent using advanced data and behavioral insights, ensuring unparalleled accuracy in every match.",
  },
  {
    icon: WrenchIcon,
    title: "Proprietary hiring tools",
    desc: "Our unique Ref-Track and AI workflows are built to eliminate hiring risks and drastically reduce your time-to-hire.",
  },
  {
    icon: UserCheckIcon,
    title: "Domain Expertise Delivers",
    desc: "Benefit from our team of expert consultants who bring over 20 years of deep industry experience across tech, sales, and leadership recruitment.",
  },
  {
    icon: DocumentCheckIcon,
    title: "Proven & Scalable Results",
    desc: "With over 1,000 successful placements and an 85% retention rate for critical hires, we deliver impactful results that help your business grow faster.",
  },
];

const traditional = [
  { label: "Applications", value: "500" },
  { label: "Screened", value: "200" },
  { label: "Interviewed", value: "50" },
];

const meritoWay = [
  { label: "AI Curated", value: "50" },
  { label: "Shortlisted", value: "20" },
  { label: "Interviewed", value: "10" },
];

const processSteps = [
  {
    num: "01",
    title: "Strategic Global Setting",
    desc: "We go beyond the job description to deeply understand the must-haves and critical success predictors for every unique role",
  },
  {
    num: "02",
    title: "AI Precision Sourcing",
    desc: "Leveraging our proprietary AI stack, we precisely match candidates from vast talent pools - only the highest-quality profiles move forward",
  },
  {
    num: "03",
    title: "Screening & Evaluation",
    desc: "Every candidate is rigorously assessed using our proprietary scorecard - skill proficiency, cultural alignment and overall role-fit.",
  },
  {
    num: "04",
    title: "Efficient Interviews",
    desc: "We value your time. You only interview the most suitable, thoroughly vetted candidates who have already passed our intensive screening",
  },
];

const engagementModels = [
  {
    tag: "AI CONSULTING",
    title: "Transform your internal hiring",
    desc1: "Modernise your existing recruitment process and reduce costs without increasing internal headcount.",
    desc2: "Best for Companies modernising their recruitment process without growing headcount.",
    features: [
      { label: "BEST FOR", text: "Companies modernising their recruitment process without growing headcount." },
      { label: "OUR ROLE", text: "We collaborate with your team to identify and integrate AI tools that add measurable value." },
      { label: "OUTCOME", text: "A scalable, tech-enabled process that significantly reduces hiring time." },
      { label: "PRICING", text: "Retainer fees linked to project scope and effort." },
    ],
    dark: false,
  },
  {
    tag: "AGENCY PARTNER",
    title: "Your full-funnel talent partner.",
    desc1: "Close critical roles — from CXOs to high-potential specialists — within tight timelines.",
    desc2: "",
    features: [
      { label: "BEST FOR", text: "Companies closing critical roles, from CXOs to high-potential specialists, against tight timelines." },
      { label: "OUR ROLE", text: "We act as an extension of your team, owning the entire hiring funnel from discovery to final offer." },
      { label: "OUTCOME", text: "Fast, high-quality placements with a typical 60% reduction in time-to-hire." },
      { label: "PRICING", text: "Success-based fees linked to the candidate's CTC." },
    ],
    dark: true,
  },
];

export default function MeritowaysClient() {
  const { openContact } = useContactModal();
  const pillarsRef = useRef<HTMLDivElement>(null);
  const funnelRef = useRef<HTMLDivElement>(null);
  const [pillarsVisible, setPillarsVisible] = useState(false);
  const [funnelVisible, setFunnelVisible] = useState(false);

  useEffect(() => {
    const pillarsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPillarsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    const funnelObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFunnelVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (pillarsRef.current) pillarsObserver.observe(pillarsRef.current);
    if (funnelRef.current) funnelObserver.observe(funnelRef.current);

    return () => {
      pillarsObserver.disconnect();
      funnelObserver.disconnect();
    };
  }, []);

  return (
    <main className="bg-[#fdf8fb] overflow-hidden">
      <section className="relative mx-auto max-w-[1272px] px-5 pt-8 pb-4">
        <Link href="/" className="absolute top-4 left-5 md:top-8 hover:opacity-70 transition-opacity">
          <ArrowLeftIcon />
        </Link>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-[100px] mt-8">
          <div className="lg:w-[450px] w-full text-left">
            <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[40px] lg:text-[48px] text-black leading-[1.2] tracking-tight">
              A unique <br className="hidden md:block" />
              approach to <br className="hidden md:block" />
              <span className="text-[#ed1a24]">PRECISION HIRING.</span>
            </h1>
          </div>
          <div className="flex-1 w-full">
            <div className="w-full aspect-[16/9] lg:aspect-[1.78/1] rounded-[10px] shadow-[0px_0px_2px_rgba(0,0,0,0.25)] relative overflow-hidden flex items-center justify-center bg-[#fdf8fb]">
              <Image
                src="/hero-graphic-merito-way.png"
                alt="Merito Way Precision Hiring"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1272px] mx-auto px-5 pt-4 pb-12">
        <div className="bg-[#0a0a0a] rounded-[10px] py-[25px] px-[20px] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center md:flex-1 relative w-full md:w-auto text-center justify-center gap-[6px]">
              <div className="flex items-center gap-1">
                <span className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-white leading-none">{s.prefix}</span>
                <span className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-[#ed1a24] leading-none">{s.value}</span>
              </div>
              <p className="text-[13px] text-white font-[family-name:var(--font-poppins)] text-center max-w-[200px] leading-snug">
                {s.label}
              </p>
              {i < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[100px] bg-white/20" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-5 py-12 flex flex-col gap-[50px]">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] md:text-[40px] text-black text-center">
            Our 4 Pillars of <span className="text-[#ed1a24] uppercase">EXCELLENCE</span>
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#4b4b4d] text-center max-w-[800px] leading-[165%]">
            Every Merito engagement rests on the same foundation - precision technology, proprietary tooling, expert judgement and proven outcomes.
          </p>
        </div>

        <div ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {pillars.map((p, i) => (
            <div
              key={i}
              className={`group bg-white rounded-[24px] border-l-[3px] border-l-transparent shadow-[0px_20px_60px_rgba(0,0,0,0.08)] hover:shadow-[0px_20px_80px_rgba(237,26,36,0.12)] hover:border-l-[#ed1a24] hover:-translate-y-2 p-8 md:p-10 flex flex-col gap-6 relative transition-all duration-500 ease-out transform
                ${pillarsVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}
              `}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="size-[48px] rounded-[12px] bg-[#ed1a24] flex items-center justify-center shadow-lg shadow-[#ed1a24]/30">
                <p.icon />
              </div>
              <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[24px] text-black transition-colors group-hover:text-[#ed1a24]">{p.title}</h3>
              <p className="text-[16px] text-[#4b4b4d] leading-[165%]">{p.desc}</p>
              <div className="w-[30px] h-[6px] rounded-full bg-[#ed1a24]/20 group-hover:bg-[#ed1a24] group-hover:w-[60px] transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f5f0f3] py-12">
        <div className="max-w-[1100px] mx-auto px-5 flex flex-col gap-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] md:text-[44px] text-black leading-tight">
              18x more precise than traditional hiring. <br/>
              <span className="text-[#ed1a24]">precision hiring.</span>
            </h2>
            <p className="text-[16px] md:text-[18px] text-[#4b4b4d] max-w-[700px] leading-[165%]">
              The same role, two very different funnels. Where traditional recruitment drowns teams in volume, Merito delivers a curated shortlist that converts
            </p>
          </div>

          <div ref={funnelRef} className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-[120px] items-start">
            <div className="flex flex-col w-full gap-8">
              <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] text-black border-b border-black/10 pb-4 uppercase">TRADITIONAL</h3>
              <div className="flex flex-col gap-8">
                <FunnelBar label="Applications" value="500" targetWidth={100} color="bg-black/20" delay={0} visible={true} />
                <FunnelBar label="Screened" value="200" targetWidth={100} color="bg-black/20" delay={0} visible={true} />
                <FunnelBar label="Interviewed" value="50" targetWidth={100} color="bg-black/20" delay={0} visible={true} />
              </div>
            </div>

            <div className="flex flex-col w-full gap-8">
              <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] text-black border-b border-black/10 pb-4">The Merito&apos;s Way</h3>
              <div className="flex flex-col gap-8">
                <FunnelBar label="AI Curated" value="50" targetWidth={80} color="bg-[#ed1a24]" delay={400} visible={funnelVisible} />
                <FunnelBar label="Shortlisted" value="20" targetWidth={40} color="bg-[#ed1a24]" delay={500} visible={funnelVisible} />
                <FunnelBar label="Interviewed" value="10" targetWidth={20} color="bg-[#ed1a24]" delay={600} visible={funnelVisible} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-5 py-12 flex flex-col gap-16">
        <div className="flex flex-col items-center gap-4">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] md:text-[40px] text-black text-center leading-tight">
            Precision-driven <br/>
            search. How we identify the <span className="text-[#ed1a24]">top 2%</span>
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#4b4b4d] text-center max-w-[700px] leading-[165%]">
            The same role, two very different funnels. Where traditional recruitment drowns teams in volume, Merito delivers a curated shortlist that converts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">
          <div className="relative flex flex-col gap-12 ml-4">
            <div className="absolute top-8 bottom-12 left-[23px] w-[2px] bg-[#ed1a24]/20" />
            {processSteps.map((step, i) => (
              <div key={i} className="relative flex items-start gap-8 z-10">
                <div className="size-[48px] rounded-full bg-white border-2 border-[#ed1a24] flex items-center justify-center flex-shrink-0">
                  <span className="font-[family-name:var(--font-poppins)] font-bold text-[16px] text-black">{step.num}</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[20px] text-black">{step.title}</h3>
                  <p className="text-[15px] text-[#4b4b4d] leading-[165%] max-w-[450px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[24px] border border-black/5 shadow-[0px_12px_40px_rgba(0,0,0,0.06)] p-10 md:p-12 flex flex-col gap-8 sticky top-32">
            <span className="text-[12px] font-bold tracking-[2px] text-[#808080] uppercase">OUTCOME</span>
            <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[28px] md:text-[32px] text-black leading-tight">
              A short, decisive <br className="hidden md:block"/>
              interview around - <br className="hidden md:block"/>
              instead of weeks of noise.
            </h3>
            <div className="w-full h-px bg-black/10" />
            <ul className="flex flex-col gap-6">
              {[
                "Only vetted, role-fit candidates reach your calendar.",
                "Proprietary scorecard for skill, culture and role-fit.",
                "AI sourcing tuned to your critical success predictors."
              ].map((bullet, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="size-[6px] rounded-full bg-[#ed1a24] flex-shrink-0 mt-2" />
                  <span className="text-[15px] text-[#4b4b4d] leading-[165%]">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-5 py-12 flex flex-col items-center gap-16">
        <Eyebrow text="ENGAGEMENT MODELS" />
        <div className="flex flex-col items-center gap-4 text-center mt-[-20px]">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] md:text-[40px] text-black">
            Flexible partnerships built for your growth.
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#4b4b4d] max-w-[600px] leading-[165%]">
            Choose the model that best aligns with your current recruitment goals and organisational structure.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {engagementModels.map((m, i) => (
            <div key={i} className={`rounded-[24px] overflow-hidden flex flex-col ${m.dark ? "bg-gradient-to-br from-black via-[#1a1a1a] to-[#2d0a0c] text-white" : "bg-white border border-black/5 shadow-[0px_8px_32px_rgba(0,0,0,0.04)]"}`}>
              <div className="p-10 pb-8 flex flex-col gap-6">
                <div className="self-start">
                  <Eyebrow text={m.tag} />
                </div>
                <h3 className={`font-[family-name:var(--font-poppins)] font-semibold text-[28px] md:text-[32px] ${m.dark ? "text-white" : "text-black"}`}>
                  {m.title}
                </h3>
                <div className="flex flex-col gap-4">
                  <p className={`text-[16px] leading-[165%] ${m.dark ? "text-white/70" : "text-[#4b4b4d]"}`}>{m.desc1}</p>
                  {m.desc2 && <p className={`text-[16px] leading-[165%] ${m.dark ? "text-white/70" : "text-[#4b4b4d]"}`}>{m.desc2}</p>}
                </div>
              </div>
              <div className="flex-1 flex flex-col px-10 pb-10 gap-6 mt-4">
                {m.features.map((f, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-6 border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <span className={`text-[12px] font-bold tracking-[1px] uppercase w-[100px] flex-shrink-0 ${m.dark ? "text-white/50" : "text-black/50"}`}>
                      {f.label}
                    </span>
                    <span className={`text-[15px] leading-[165%] ${m.dark ? "text-white/90" : "text-black/80"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-5 py-12">
        <div className="bg-gradient-to-br from-black to-[#2d0a0c] rounded-[24px] overflow-hidden p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#ed1a24]/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col items-start gap-6 max-w-[600px]">
            <Eyebrow text="READY WHEN YOU ARE" />
            <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] md:text-[44px] text-white leading-[1.2]">
              Let&apos;s find the 2% who will move your business forward.
            </h2>
          </div>
          <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={openContact}
              className="bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[16px] h-[56px] px-8 rounded-[8px] flex items-center justify-center gap-3 hover:bg-[#c8151e] transition-colors w-full md:w-auto"
            >
              Book a call with us
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#fdf8fb] py-12 pb-32">
        <div className="max-w-[800px] mx-auto px-5 flex flex-col items-center text-center gap-8">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[36px] md:text-[48px] text-black">
            Get started with Merito
          </h2>
          <p className="text-[16px] md:text-[18px] text-[#4b4b4d] leading-[165%] max-w-[600px]">
            Help us with what you are looking for and our team will get in-touch understand your talent requirements
          </p>
          <button
            onClick={openContact}
            className="mt-4 bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[16px] h-[50px] px-10 rounded-[8px] flex items-center justify-center hover:bg-[#c8151e] transition-colors"
          >
            CONTACT US
          </button>
        </div>
      </section>
    </main>
  );
}
