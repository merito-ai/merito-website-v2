"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import HeroWinsCard from "@/components/HeroWinsCard";
import RevealOnScroll from "@/components/anim/RevealOnScroll";
import { StaggerGroup, StaggerItem } from "@/components/anim/StaggerGroup";
import CountUp from "@/components/anim/CountUp";
import AccordionItem from "@/components/anim/AccordionItem";
import GrowBars from "@/components/anim/GrowBars";
import TestimonialCarousel from "@/components/anim/TestimonialCarousel";
import Marquee from "@/components/anim/Marquee";
import {
  Waveform,
  TypingDots,
} from "@/components/anim/MicroAnims";
import VideoPlayer from "@/components/VideoPlayer";
import { useContactModal } from "@/context/ContactModalContext";

type Metric = {
  label: string;
  traditional: string;
  merito: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
};

const heroStats = [
  { value: 50, suffix: "+", label: "Clients" },
  { value: 1000, suffix: "+", label: "Industries served" },
  { value: 60, suffix: "%", label: "Offer - to - join rate" },
  { value: 48, suffix: "hrs", label: "To source top 2% Talent" },
];

const misconceptionPairs = [
  {
    icon: "/figma-exports/fa-solid_hands-helping.png",
    myth: "My intuition & experience is enough to hire top talent.",
    reality:
      "We hire top talent with conviction moving beyond first impressions by using a Skill-based Hiring Platform to provide a 90% fit accuracy, using psychometrics that are nearly 2x more predictive of success than traditional headhunting.",
  },
  {
    icon: "/figma-exports/mdi_search.png",
    myth: "High-volume manual outreach",
    reality:
      "Manual sourcing can't keep up with modern business. We use a Skill-based Hiring Platform to match specific competencies to your job brief, reaching the 1% who aren't even looking at job boards.",
  },
  {
    icon: "/figma-exports/material-symbols-light_quick-reference-all-rounded.png",
    myth: "ATS keyword scores identify the best profiles or managers.",
    reality:
      "Resumes tell stories; skills tell the truth. We lead your executive search by putting candidates through real-world simulations, ensuring they can actually do the job before you meet them.",
  },
];

const smallTestimonials = [
  {
    quote:
      "The leadership at Merito truly understands what growing companies need. Their genuine commitment and consistent follow-through made our hiring journey seamless — we found the right people faster than we ever expected.",
    name: "Anuja Kishore CEO",
    role: "Lighthouse",
    initials: "LR",
    color: "bg-[#3b82f6]",
  },
  {
    quote:
      "Merito redefined how we hire. From mapping our exact needs to shortlisting candidates who were the RIGHT fit — their focused, structured approach helped us close critical roles on time, every time.",
    name: "Sameer Bhopkar",
    role: "DGM Corp Development - Shyam Steel",
    initials: "SB",
    color: "bg-[#16a34a]",
  },
  {
    quote:
      "As we scaled our D2C presence, Merito stepped up with speed and precision. They helped us hire leadership across Finance, Operations, and Marketing with a time-to-hire that was nothing short of remarkable.",
    name: "Sneh Jain",
    role: "Co-founder - The Bakers Dozen",
    initials: "SJ",
    color: "bg-[#f59e0b]",
  },
  {
    quote:
      "We were building fast and needed the right talent in Tech and HR — quickly. Merito's assessment-driven recruitment meant we only engaged with candidates who were truly aligned, and both roles were closed in just 2 weeks.",
    name: "Darshan Teredesai",
    role: "Co-founder - Olous App",
    initials: "DT",
    color: "bg-[#8b5cf6]",
  },
];

const funnelItems = [
  {
    title: "Centralized Hiring Intelligence",
    body:
      "Replace the chaos of fragmented spreadsheets with a single, intelligent dashboard that provides 360-degree visibility into every role, candidate, and decision in real-time.",
    open: true,
  },
  {
    title: "Zero-Friction Workflows",
    body:
      "Accelerate your time-to-hire with a streamlined process that manages everything from skill validation to final joining within a single, frictionless ecosystem.",
  },
  {
    title: "Real-Time Feedback Loops",
    body:
      "Eliminate back-and-forth friction with a real-time coordination hub that keeps Merito's expert consultants and your hiring managers in perfect strategic sync.",
  },
  {
    title: "Experience-First Hiring",
    body:
      "Build a high-retention culture starting from the first interview with a process that prioritizes stakeholder alignment and candidate satisfaction above all else.",
  },
];

const performanceMetrics: Metric[] = [
  { 
    label: "Time per Hire", 
    traditional: "60 Days", 
    merito: "14 Days", 
    change: "70%", 
    trend: "down",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  },
  { 
    label: "Founder Hours", 
    traditional: "12 Hours", 
    merito: "2 Hours", 
    change: "89%", 
    trend: "down",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  },
  { 
    label: "Recruiter Hours", 
    traditional: "40 Hours", 
    merito: "40 Hours", 
    change: "70%", 
    trend: "down",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    )
  },
  { 
    label: "Success Rate", 
    traditional: "50%", 
    merito: "90%", 
    change: "", 
    trend: "up",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    )
  },
  { 
    label: "Retention (2yr)", 
    traditional: "60%", 
    merito: "85%", 
    change: "", 
    trend: "up",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    )
  },
  { 
    label: "Offer Dropout", 
    traditional: "20%", 
    merito: "10%", 
    change: "", 
    trend: "up",
    icon: (
      <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      </svg>
    )
  },
];

const faqs = [
  {
    q: "What makes Merito different from traditional recruitment agencies?",
    a: "Merito combines Artificial Intelligence for efficiency with Acquired Intelligence for effectiveness. We use proprietary tools like Ref-Track alongside senior consultants with deep domain expertise, so only the top 2% of talent reaches your interview stage.",
  },
  {
    q: "How quickly can Merito start delivering candidates?",
    a: "We can identify the top 2% of talent within 48 hours of receiving your brief. Most clients receive a curated shortlist within 5 to 7 days, with critical roles closing significantly faster than the industry average.",
  },
  {
    q: "What is Ref-Track and why does it matter?",
    a: "Ref-Track is our proprietary reference and risk-check platform. It automates background validation, culture-fit signals, and reputation checks for leadership and high-risk hires so there are no surprises after the offer is accepted.",
  },
  {
    q: "What roles and industries does Merito specialise in?",
    a: "We hire across technology, product, sales, growth, HR, and leadership roles. Our teams have served fast-growing companies across SaaS, retail, D2C, finance, media, education, and more.",
  },
  {
    q: "How does the pricing / engagement model work?",
    a: "We tailor the engagement model to your hiring urgency and internal bandwidth. That can range from platform-led support to full-funnel retained search, with clear checkpoints, aligned deliverables, and transparent ownership from day one.",
  },
  {
    q: "Does Merito replace our internal HR / Talent Acquisition team?",
    a: "No. We are built to amplify your internal team, not replace it. Some companies use us as an expert extension for niche or leadership roles, while others plug our platform and workflows into their existing talent function.",
  },
];

function SectionPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#ed1a24] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.04em] text-white shadow-[0_8px_24px_rgba(237,26,36,0.22)]">
      {text}
    </span>
  );
}

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1340px] px-4 sm:px-6 lg:px-10 ${className}`}>
      {children}
    </div>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}


function HeroSection() {
  return (
    <section className="bg-white pb-6 pt-8 sm:pt-12">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <RevealOnScroll className="max-w-[600px]" duration={0.7} y={20}>
            <SectionPill text="AI-ENABLED FULL-FUNNEL RECRUITMENT PARTNER" />
            <h1 className="mt-8 font-[family-name:var(--font-gabarito)] text-[3.05rem] font-semibold leading-[1.03] tracking-[-0.045em] text-black sm:text-[4.15rem]">
              The talent partner that turns job briefs into{" "}
              <span className="text-[#ed1a24]">DREAM HIRES.</span>
            </h1>
            <p className="mt-6 max-w-[515px] text-[17px] font-medium leading-[1.65] text-[#4b4b4d]">
              We&apos;re a human-centric AI recruitment agency that blends strategic
              human insight with a proprietary Skill-based Hiring Platform. No
              resume spam. No gut-feel guesses. Just a faster way to hire top
              talent from day one.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex flex-col items-start gap-3">
                <Link
                  href="/contact"
                  className="inline-flex min-h-[56px] items-center justify-center rounded-[12px] border border-[#ed1a24]/40 px-6 text-[18px] font-semibold text-[#6f6f71] transition-colors hover:border-[#ed1a24] hover:text-[#ed1a24]"
                >
                  Start hiring smarter
                </Link>
                <p className="pl-1 text-[13px] font-medium text-[#6d6f74]/70">
                  No-risk consultation · Confidential discussion
                </p>
              </div>
              <Link
                href="#proof"
                className="inline-flex min-h-[56px] items-center gap-3 rounded-[12px] bg-[#ed1a24] px-6 text-[18px] font-semibold text-white transition-colors hover:bg-[#c8151e]"
              >
                <span>See our Results</span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-black text-white">
                  <ArrowUpRightIcon />
                </span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                {["R", "G", "C", "P", "H", "T"].map((letter, index) => (
                  <span
                    key={letter}
                    className="-mr-2 inline-flex size-[31px] items-center justify-center rounded-full border border-white bg-black text-[11px] font-bold text-white last:mr-0"
                    style={{ zIndex: 6 - index }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
              <div className="text-[13px] leading-tight">
                <div className="text-[15px] tracking-[0.12em] text-[#ffcc01]">★★★★★</div>
                <div className="mt-1 font-semibold text-[#4b4b4d]">
                  85% avg. 2-year retention | Trusted by 50+ companies
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <HeroWinsCard />
        </div>

        <StaggerGroup
          className="mt-11 rounded-[18px] bg-black px-3 py-3 sm:px-4 lg:mt-24"
          stagger={0.08}
        >
          <div className="grid gap-1 divide-y divide-white/8 overflow-hidden rounded-[14px] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {heroStats.map((stat) => (
              <StaggerItem
                key={stat.label}
                className="flex min-h-[104px] flex-col items-center justify-center px-5 py-6 text-center"
              >
                <div className="font-[family-name:var(--font-gabarito)] text-[2.2rem] font-semibold text-white">
                  <CountUp value={stat.value} duration={1.6} />
                  <span className="text-[#ed1a24]">{stat.suffix}</span>
                </div>
                <div className="mt-2 text-[15px] font-semibold text-white">
                  {stat.label}
                </div>
              </StaggerItem>
            ))}
          </div>
        </StaggerGroup>
      </Container>
    </section>
  );
}

function MisconceptionCard({ pair }: { pair: typeof misconceptionPairs[0] }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <StaggerItem
      as="article"
      className="perspective-1000 relative min-h-[220px] w-full"
    >
      <div
        className="relative h-full min-h-[220px] w-full cursor-pointer"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <motion.div
          className="relative h-full w-full will-change-transform"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ 
            duration: 0.6, 
            ease: [0.23, 1, 0.32, 1] 
          }}
        >
          {/* Front Side (Myth) */}
          <div 
            className="absolute inset-0 z-10 flex flex-col gap-5 rounded-[18px] border border-[#f4d8d8] bg-[#fef7f7] px-6 py-6 shadow-[0_18px_50px_rgba(17,35,89,0.04)]"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="inline-flex size-11 items-center justify-center rounded-[10px] bg-[#131313]">
              <Image src={pair.icon} alt="" width={28} height={28} className="size-7" />
            </div>
            <p className="text-[16px] font-semibold leading-[1.45] text-black">
              <span className="font-bold">Myth:</span> {pair.myth}
            </p>
          </div>

          {/* Back Side (Reality) */}
          <div 
            className="absolute inset-0 flex h-full items-center rounded-[18px] border border-[#f4d8d8] bg-white px-6 py-6 shadow-[0_18px_50px_rgba(17,35,89,0.04)]"
            style={{ 
              backfaceVisibility: "hidden", 
              transform: "rotateY(180deg)" 
            }}
          >
            <p className="text-[15px] leading-[1.65] text-[#4b4b4d]">
              <span className="font-bold text-[#ed1a24]">Reality:</span>{" "}
              {pair.reality}
            </p>
          </div>
        </motion.div>
      </div>
    </StaggerItem>
  );
}

function MisconceptionSection() {
  return (
    <section className="bg-white py-12">
      <Container>
        <SectionPill text="THE MISCONCEPTION" />
        <div className="mt-8 max-w-[980px]">
          <h2 className="font-[family-name:var(--font-gabarito)] text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[3.15rem]">
            Your hiring isn&apos;t slow.{" "}
            <span className="text-[#ed1a24]">Your recruitment approach is.</span>
          </h2>
          <p className="mt-5 max-w-[920px] text-[17px] font-medium leading-[1.75] text-[#5f5f61]">
            Most B2B SaaS teams pour budget into campaigns that look active but
            generate nothing. Here&apos;s why. Most growth companies invest heavily
            in recruiters and paid tools however fail to hire quality talent.
          </p>
        </div>

        <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-3" stagger={0.12}>
          {misconceptionPairs.map((pair) => (
            <MisconceptionCard key={pair.myth} pair={pair} />
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section id="proof" className="bg-white py-12">
      <Container>
        <div className="text-center">
          <SectionPill text="THE REAL PROBLEM" />
          <h2 className="mx-auto mt-8 max-w-[620px] font-[family-name:var(--font-gabarito)] text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[3.15rem]">
            Don&apos;t take our word for it.{" "}
            <span className="text-[#ed1a24]">Take theirs.</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <TestimonialCarousel
            items={[
              {
                quote:
                  "We were doing ads, campaigns we were doing everything but the biggest game change for us was to understand the logic behind why and how things are working, and that only came because your smart team was in picture.",
                name: "Udita Pal",
                role: "Co-founder - Salt",
                color: "bg-[#d65f64]",
                initials: "UP",
              },
            ]}
            intervalMs={7000}
          />

          <VideoPlayer 
            src="/Video-testimonial.mp4"
            name="Udita Pal"
            description="on sustainable growth"
          />

        </div>

        <Marquee speed={60}>
          {smallTestimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="flex w-[340px] min-h-[220px] flex-col shrink-0 rounded-[18px] border border-black/8 bg-white px-5 py-6 shadow-[0_18px_50px_rgba(17,35,89,0.04)]"
            >
              <p className="text-[15px] leading-[1.85] text-[#55565a]">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-auto pt-6 flex items-center gap-3">
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-full text-[13px] font-semibold text-white ${testimonial.color}`}
                >
                  {testimonial.initials}
                </span>
                <div>
                  <p className="text-[16px] font-semibold text-[#35353a] leading-tight">
                    {testimonial.name}
                  </p>
                  <p className="text-[13px] text-[#6d6f74] mt-0.5">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </Marquee>
      </Container>
    </section>
  );
}

const panelContent = [
  {
    card1: {
      subtitle: "Dashboard Active",
      title: "12 Open Roles",
      footer: (
        <div className="mt-3 flex flex-wrap gap-4 text-[15px] text-[#57595d]">
          <span>3 stages</span>
          <span>48 candidates</span>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 18h16" />
          <path d="M7 18V6h10v12" />
          <path d="M9 14h2" />
          <path d="M13 10h2" />
        </svg>
      ),
      hasChart: true
    },
    card2: {
      title: "Real time Tracking",
      subtitle: "Monitoring pipeline and candidate progress in real time.",
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v6" />
          <path d="M16.24 7.76A6 6 0 1 1 7.76 7.76" />
        </svg>
      ),
      hasActivePill: false,
      rightIcon: (
        <div className="hidden text-[#ff8087] sm:block">
          <svg viewBox="0 0 48 48" className="size-12" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="24" cy="24" r="16" />
            <path d="M24 14v10l7 4" />
          </svg>
        </div>
      )
    }
  },
  {
    card1: {
      subtitle: "Pipeline Live",
      title: "86% Completion",
      footer: (
        <div className="mt-3 flex flex-wrap gap-4 text-[15px] text-[#57595d]">
          <span>Sourcing &rarr; Screening &rarr; Offer &rarr; Joined</span>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      hasChart: false
    },
    card2: {
      title: "CV-to-Joining Flow",
      subtitle: "",
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12c0 4 4 4 8 0s8-4 8 0" />
        </svg>
      ),
      hasActivePill: true,
      rightIcon: null
    }
  },
  {
    card1: {
      subtitle: "COLLABORATION",
      title: "5 Active Teams",
      footer: (
        <div className="mt-3 flex flex-wrap gap-4 text-[15px] text-[#57595d]">
          <span>Hiring managers &bull; Recruiters &bull; Clients</span>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87" />
          <path d="M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      hasChart: false
    },
    card2: {
      title: "Shared Workspace",
      subtitle: "",
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      hasActivePill: true,
      rightIcon: null
    }
  },
  {
    card1: {
      subtitle: "ENGAGEMENT",
      title: "94% Response Rate",
      footer: (
        <div className="mt-3 flex flex-wrap gap-4 text-[15px] text-[#57595d]">
          <span>Timely updates &bull; Structured touchpoints</span>
        </div>
      ),
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
      hasChart: false
    },
    card2: {
      title: "Stakeholder Hub",
      subtitle: "",
      icon: (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      hasActivePill: true,
      rightIcon: null
    }
  }
];

function FullFunnelSection() {
  const [activeFunnelIndex, setActiveFunnelIndex] = useState(0);
  const activePanel = panelContent[activeFunnelIndex];

  return (
    <section id="tools" className="bg-white py-12">
      <Container>
        <div className="text-center">
          <SectionPill text="THE FULL-FUNNEL SOLUTION" />
          <h2 className="mx-auto mt-8 max-w-[860px] font-[family-name:var(--font-gabarito)] text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[3.1rem]">
            Streamline Your Executive Search by Leveraging a{" "}
            <span className="text-[#ed1a24]">Skill-based Hiring Platform</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.95fr)]">
          <article className="rounded-[28px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8f8fb_100%)] p-6 shadow-[0_30px_80px_rgba(17,35,89,0.08)] sm:p-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b9bec6] bg-white px-4 py-2 text-[14px] font-semibold text-[#4d4f53]">
              <span className="size-3 rounded-full bg-[#58d57b]" />
              ENGINE RUNNING
            </div>
            <div className="mt-8 flex items-center gap-3 text-[15px] font-semibold text-black">
              <span className="size-3 rounded-full bg-[#ed1a24]" />
              LIVE EXECUTION
            </div>
            <div className="mt-7 grid gap-4 transition-all duration-300">
              {/* CARD 1 */}
              <div className="rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_16px_34px_rgba(17,35,89,0.08)]">
                <div className="flex items-start gap-4">
                  <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[#16244c] text-white">
                    {activePanel.card1.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium uppercase tracking-wider text-[#525357]">
                      {activePanel.card1.subtitle}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-gabarito)] text-[1.9rem] font-semibold leading-none text-black">
                      {activePanel.card1.title}
                    </p>
                    <div className="mt-4 h-px w-full bg-black/15" />
                    {activePanel.card1.footer}
                  </div>
                  {activePanel.card1.hasChart && (
                    <div className="hidden h-[92px] w-[145px] rounded-[14px] bg-[linear-gradient(180deg,rgba(255,221,223,0.45),rgba(255,255,255,0.5))] p-4 sm:block">
                      <GrowBars
                        className="flex h-full items-end gap-[6px]"
                        barClassName="w-3 rounded-full bg-[linear-gradient(180deg,#ffdadc,#f68085)]"
                        heights={[40, 68, 30, 82, 56, 73, 61, 92]}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* CARD 2 */}
              <div className="rounded-[18px] border border-black/8 bg-white p-5 shadow-[0_16px_34px_rgba(17,35,89,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[#16244c] text-white">
                      {activePanel.card2.icon}
                    </div>
                    <div>
                      <p className="font-[family-name:var(--font-gabarito)] text-[1.9rem] font-semibold leading-none text-black">
                        {activePanel.card2.title}
                      </p>
                      {activePanel.card2.subtitle && (
                        <p className="mt-3 text-[18px] leading-[1.5] text-[#5a5a5e]">
                          {activePanel.card2.subtitle}
                        </p>
                      )}
                      {activePanel.card2.hasActivePill && (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#eefdf1] px-3 py-1.5 text-[13px] font-semibold text-[#40d36f]">
                          Active <span className="size-2 rounded-full bg-[#40d36f]" />
                        </div>
                      )}
                    </div>
                  </div>
                  {activePanel.card2.rightIcon}
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-end justify-between">
              <div>
                <p className="text-[14px] text-[#5d5f63]">Merito.ai</p>
                <p className="mt-2 text-[14px] font-semibold uppercase tracking-[0.08em] text-[#3e3f44]">
                  Status: <span className="text-[#58d57b]">Optimized</span>
                </p>
              </div>
              <div className="flex items-end gap-2">
                <span className="h-7 w-[6px] rounded-full bg-[#d4d7dd]" />
                <span className="h-7 w-[6px] rounded-full bg-[#ced1d8]" />
                <span className="h-8 w-[6px] rounded-full bg-[#7a879f]" />
                <span className="h-7 w-[6px] rounded-full bg-[#ed1a24]" />
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {funnelItems.map((item, index) => (
              <AccordionItem
                key={item.title}
                isOpen={activeFunnelIndex === index}
                onToggle={() => setActiveFunnelIndex(index)}
                className="group rounded-[20px] border border-black/8 border-l-[6px] border-l-transparent bg-white shadow-[0_16px_36px_rgba(17,35,89,0.06)] data-[open=true]:border-l-[#ed1a24] data-[open=true]:border-t-black/8 data-[open=true]:border-r-black/8 data-[open=true]:border-b-black/8 transition-colors cursor-pointer"
                headerClassName="px-6 py-5"
                contentClassName="px-6"
                title={
                  <p className="text-[18px] font-medium text-[#4b4b4d] group-data-[open=true]:font-bold group-data-[open=true]:text-black">
                    {item.title}
                  </p>
                }
              >
                <p className="max-w-[520px] pb-5 text-[16px] leading-[1.7] text-[#66686d]">
                  {item.body}
                </p>
              </AccordionItem>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="rounded-full border border-black/8 bg-white px-8 py-4 text-center text-[20px] font-semibold italic text-black shadow-[0_16px_36px_rgba(17,35,89,0.04)]">
            &ldquo;If momentum stalls, we know why within days -{" "}
            <span className="text-[#ed1a24]">not quarters.</span>&rdquo;
          </div>
        </div>
      </Container>
    </section>
  );
}

function TechnologyCard({
  title,
  body,
  iconSrc,
  tagline,
  children,
}: {
  title: string;
  body: string;
  iconSrc: string;
  tagline: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem
      as="article"
      y={40}
      className="group flex h-[600px] flex-col rounded-[20px] border border-black/8 bg-white p-5 shadow-[0_18px_50px_rgba(17,35,89,0.05)] transition-transform duration-300 hover:-translate-y-1.5"
    >
      <div className="mb-5 inline-flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-[#0d1427] overflow-hidden transition-colors duration-300 group-hover:bg-[#ed1a24]">
        <Image
          src={iconSrc}
          alt={title}
          width={44}
          height={44}
          className="size-full object-cover"
          unoptimized
        />
      </div>
      <h3 className="font-[family-name:var(--font-gabarito)] text-[1.9rem] font-semibold leading-[1] text-black">
        {title}
      </h3>
      <p className="mt-4 text-[16px] leading-[1.7] text-[#595b61]">{body}</p>
      <div className="mt-6 flex-1 overflow-hidden">{children}</div>
      <p className="mt-4 shrink-0 text-[15px] leading-[1.7] text-[#66686d]">{tagline}</p>
    </StaggerItem>
  );
}

function PropTechSection() {
  return (
    <section className="bg-white py-12">
      <Container>
        <div className="text-center">
          <SectionPill text="PROPRIETARY TECHNOLOGY" />
          <h2 className="mx-auto mt-8 max-w-[900px] font-[family-name:var(--font-gabarito)] text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[3.05rem]">
            The Agents That Work While Your Experts Focus
          </h2>
          <p className="mx-auto mt-5 max-w-[760px] text-[18px] leading-[1.7] text-[#5f6166]">
            Merito&apos;s AI agents handle the heavy lifting so your team closes
            faster, not harder.
          </p>
        </div>

        <StaggerGroup className="mt-14 grid gap-6 lg:grid-cols-3" stagger={0.1}>
          <TechnologyCard
            title="Multi-Channel Sourcing"
            body="Find the right candidates before your competitors do."
            iconSrc="/homepage-6-cards-icons/Multichannel sourcing.svg"
            tagline="Scans LinkedIn, job boards & GitHub — simultaneously, silently, non-stop."
          >
            <div className="rounded-[16px] bg-[#4b4b4d] p-5">
              <div className="grid gap-3">
                {[
                  {
                    label: "Precision Matching",
                    icon: (
                      <svg className="size-5 text-[#f472b6]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 9c1.38 0 2.5-1.12 2.5-2.5S17.38 4 16 4s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-8 0c1.38 0 2.5-1.12 2.5-2.5S9.38 4 8 4 5.5 5.12 5.5 6.5 6.62 9 8 9zm5 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Understands Context",
                    icon: (
                      <svg className="size-5 text-[#0d9488]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Instant Results",
                    icon: (
                      <svg className="size-5 text-[#f59e0b]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Learn & Improves",
                    icon: (
                      <svg className="size-5 text-[#ef4444]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3v18h18v-2H5V3H3zm14 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5-3c.83 0 1.5-.67 1.5-1.5S12.83 8.5 12 8.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5-3c.83 0 1.5-.67 1.5-1.5S7.83 5.5 7 5.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM17 11.5l-4-3-4 3" />
                      </svg>
                    ),
                  },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.11, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-3 rounded-[10px] bg-white px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                    <span className="flex size-7 items-center justify-center">{item.icon}</span>
                    <span className="font-bold text-[#545558] text-[15px]">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </TechnologyCard>

          <TechnologyCard
            title="AI Resume Sourcing"
            body="No more reading 300 resumes. Merito reads them for you."
            iconSrc="/homepage-6-cards-icons/AI resume sourcing.svg"
            tagline="Ranks by fit, not just keywords — because context is everything in hiring."
          >
            <div className="grid gap-3">
              {[
                { name: "Arun Kumar", score: 87 },
                { name: "Swathi Killi", score: 94 },
                { name: "Mahesh Rao", score: 99 },
              ].map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.13, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex items-center justify-between rounded-[12px] border border-[#a2e6b5] bg-[#f2fbf5] p-3 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black/10 text-black/40">
                       <svg className="size-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#4b4b4d]">{c.name}</p>
                      <p className="flex items-center gap-1 mt-0.5 text-[12px] font-bold text-[#22c55e]">
                        <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Shortlisted
                      </p>
                    </div>
                  </div>
                  <div className="text-[26px] font-bold tracking-tight text-[#22c55e]"><CountUp value={c.score} suffix="%" duration={1.2} /></div>
                </motion.div>
              ))}
            </div>
          </TechnologyCard>

          <TechnologyCard
            title="AI Agent Screening"
            body="Your outreach never sleeps. Ours calls, follows up & books — 24/7."
            iconSrc="/homepage-6-cards-icons/Ai agent screening.svg"
            tagline="Natural AI voice that candidates actually respond to."
          >
            <div className="space-y-4">
              <div className="rounded-[16px] bg-[#d7d7d7] p-5 shadow-sm">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <svg className="size-5 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                       <div>
                         <p className="font-bold text-black text-[16px]">Stephen Rogs</p>
                         <p className="text-[12px] font-semibold text-[#686a70]">Interview Reminder</p>
                       </div>
                    </div>
                    <span className="text-[15px] font-bold text-[#ed1a24]">02:34</span>
                 </div>
                 <Waveform
                    count={14}
                    className="mt-5 flex h-4 items-center justify-center gap-[4px]"
                    barClassName="block w-[2px] h-full rounded-full bg-black"
                  />
              </div>

              <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fce7f3] text-[#db2777]">
                   <svg className="size-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div className="rounded-[12px] rounded-tl-sm bg-[#4b4b4d] px-4 py-4 text-[14px] leading-snug font-bold text-white shadow-sm">
                  &ldquo;Hi Stephen, confirming your interview at tomorrow at 10 AM?&rdquo;
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mt-3 flex justify-end gap-3">
                <div className="rounded-[24px] rounded-br-sm border border-black/20 bg-white px-5 py-3 text-[14px] font-bold text-[#686a70] shadow-sm">
                  &ldquo;Yes! Can you send the meeting link?&rdquo;
                </div>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#d7d7d7] text-black/60">
                  <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
              </motion.div>
            </div>
          </TechnologyCard>

          <TechnologyCard
            title="AI Video Interview"
            body="Run hundreds of technical interviews — without a single interviewer."
            iconSrc="/homepage-6-cards-icons/AI video interview.svg"
            tagline="Merito evaluates depth, not just answers. Available round the clock."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* AI Thinking panel */}
                <div className="relative flex h-[110px] items-center justify-center overflow-hidden rounded-[14px] bg-black">
                  {/* ambient glow breathes */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ background: "radial-gradient(ellipse at center, rgba(255,72,210,0.18) 0%, rgba(64,39,255,0.14) 50%, transparent 75%)" }}
                  />
                  {/* outer ring — spins clockwise */}
                  <motion.div
                    className="absolute size-[62px] rounded-full border-[3px] border-t-[#ff48d2] border-r-[#4027ff] border-b-[#4027ff] border-l-[#ff48d2] mix-blend-screen"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ filter: "drop-shadow(0 0 8px #ff48d2)" }}
                  />
                  {/* inner ring — counter-spins */}
                  <motion.div
                    className="absolute size-[36px] rounded-full border-[2px] border-t-[#4027ff] border-r-[#ff48d2] border-b-[#ff48d2] border-l-[#4027ff] mix-blend-screen"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    style={{ filter: "drop-shadow(0 0 5px #4027ff)" }}
                  />
                  {/* center pulse dot */}
                  <motion.div
                    className="absolute size-[8px] rounded-full bg-white mix-blend-screen"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                {/* Adarsh V panel */}
                <div className="relative flex h-[110px] items-end overflow-hidden rounded-[14px] border border-black/10">
                  <Image src="/adarsh v.png" alt="Adarsh V" fill className="object-cover object-top" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="relative w-full p-3 text-center">
                    <span className="inline-block rounded bg-black/70 px-3 py-1.5 text-[11px] font-bold text-white shadow-xl">Adarsh V</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-[16px] bg-[#4b4b4d] p-5 text-white shadow-sm">
                <div className="flex items-center justify-between text-[15px] mb-6">
                  <span className="font-bold">Live Skills Evaluation</span>
                  <span className="flex items-center gap-1.5 text-[12px] text-white/90">
                    <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                    Listening
                  </span>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Technical Depth", score: 100 },
                    { label: "Problem Solving", score: 86 },
                    { label: "Communication", score: 92 },
                  ].map((skill, i) => (
                    <div key={i}>
                      <div className="mb-2 flex justify-between text-[12px] font-semibold text-white">
                        <span>{skill.label}</span>
                        <CountUp value={skill.score} suffix="%" duration={1.0} />
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/20">
                        <motion.div className="h-full rounded-full bg-[#22c55e]" initial={{ width: 0 }} whileInView={{ width: `${skill.score}%` }} viewport={{ once: true }} transition={{ delay: i * 0.15 + 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TechnologyCard>

          <TechnologyCard
            title="Candidate Brief"
            body="Your sharpest interviewer, now with an AI whispering in their ear."
            iconSrc="/homepage-6-cards-icons/candidate brief.svg"
            tagline="AI interview insights, personality traits & sourcing score - so you hire with confidence."
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[14px] border border-black/10 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex h-[70px] items-end justify-center gap-2.5 px-2 border-b border-black/10 pb-1 relative">
                    <div className="absolute bottom-0 w-full border-b border-dashed border-black/20 pb-4 h-0" />
                    <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ originY: 1 }} className="w-[14px] rounded-t-sm bg-[#f2a65a] h-[40%] border-[1.5px] border-black" />
                    <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ originY: 1 }} className="w-[14px] rounded-t-sm bg-[#ed1a24] h-[80%] border-[1.5px] border-black relative">
                      <div className="absolute -top-[10px] left-1/2 w-8 border-t-[1.5px] border-black -translate-x-1/2"></div>
                      <div className="absolute -top-[13px] left-1/2 size-1.5 bg-[#ed1a24] border border-black -translate-x-1/2 rounded-full"></div>
                    </motion.div>
                    <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ originY: 1 }} className="w-[14px] rounded-t-sm bg-[#5bc0be] h-[60%] border-[1.5px] border-black" />
                  </div>
                  <div className="mt-4 text-center text-[12px] leading-snug font-bold text-[#4b4b4d]">
                    <p className="italic">AI Interview report</p>
                    <p className="text-[#6d6f74] italic font-semibold">Full assessment</p>
                  </div>
                </div>
                <div className="rounded-[14px] border border-black/10 bg-white p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex h-[70px] flex-col justify-center gap-[6px] relative">
                    <div className="absolute -top-3 -right-2 rounded-[10px] bg-[#22c55e] px-2 py-0.5 text-[9px] text-white font-bold tracking-wider">● 75%</div>
                    {[
                      {w: 71, c: '#22c55e'}, {w: 100, c: '#22c55e'}, {w: 64, c: '#22c55e'}, {w: 91, c: '#a3e635'}, {w: 57, c: '#eab308'}
                    ].map((bar, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-[6px] flex-1 rounded-full bg-black/5">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: bar.c }} initial={{ width: 0 }} whileInView={{ width: `${bar.w}%` }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
                        </div>
                        <span className="text-[8px] font-bold text-[#4b4b4d] w-5">{bar.w}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-[12px] italic font-bold text-[#4b4b4d]">
                    Personality test
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] bg-[#4b4b4d] p-5 shadow-sm">
                <div className="grid gap-3">
                  {[
                    { label: "AI Assistant", val: "", icon: (<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>), dark: false },
                    { label: "Big 5 personality test", val: "", icon: (<svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), dark: false },
                    { label: "Sourcing assessment", val: 84, icon: (<svg className="size-5 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>), dark: true },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-[10px] px-4 py-3 ${item.dark ? 'bg-[#3b3b3d] border border-white/10' : 'bg-white'}`}>
                      <div className={`flex items-center gap-3 ${item.dark ? 'text-white' : 'text-[#4b4b4d]'}`}>
                        <span className="flex size-6 items-center justify-center">{item.icon}</span>
                        <span className="text-[14px] font-bold">{item.label}</span>
                      </div>
                      {item.val ? (
                         <span className="text-[14px] font-bold text-[#ed1a24]"><CountUp value={typeof item.val === "number" ? item.val : 0} suffix="/100" duration={1.2} /></span>
                      ) : (
                         <span className="size-2.5 rounded-full bg-[#ed1a24]"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TechnologyCard>

          <TechnologyCard
            title="WhatsApp Engagement"
            body="Candidates don't check emails. They check WhatsApp. So that's where Merito shows up."
            iconSrc="/homepage-6-cards-icons/whatsapp 1.svg"
            tagline="Instant replies, smart nudges - zero ghosting."
          >
            <div className="mx-auto max-w-[280px] rounded-[34px] border-[6px] border-black bg-[#f1efe7] p-3 shadow-[0_20px_40px_rgba(17,35,89,0.12)]">
              <div className="rounded-[24px] bg-[#0d6c60] px-4 py-3 text-white">
                <p className="text-[14px] font-semibold">Merito AI</p>
                <p className="text-[11px] text-white/70">Online</p>
              </div>
              <div className="space-y-3 px-3 py-4 text-[12px]">
                <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.35 }} className="max-w-[82%] rounded-[12px] rounded-tl-sm bg-white px-3 py-2 text-[#4b4b4d] shadow-[0_8px_18px_rgba(17,35,89,0.06)]">
                  Hi Akash, We have an exciting Senior Developer role at TechCorp.
                  Interested?
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.28, duration: 0.35 }} className="ml-auto max-w-[70%] rounded-[12px] rounded-tr-sm bg-[#dbf9c8] px-3 py-2 text-[#2a5536]">
                  Yes, tell me more!
                </motion.div>
                <motion.div initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.46, duration: 0.35 }} className="max-w-[82%] rounded-[12px] rounded-tl-sm bg-white px-3 py-2 text-[#4b4b4d] shadow-[0_8px_18px_rgba(17,35,89,0.06)]">
                  Great! It&apos;s a remote-first role with 26-35 LPA. Can you share
                  your updated resume?
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.64, duration: 0.35 }} className="ml-auto max-w-[70%] rounded-[12px] rounded-tr-sm bg-[#dbf9c8] px-3 py-2 text-[#2a5536]">
                  Sure, here it is.
                </motion.div>
                <div className="max-w-[40%] rounded-[12px] rounded-tl-sm bg-white px-3 py-2 shadow-[0_8px_18px_rgba(17,35,89,0.06)]">
                  <TypingDots
                    className="flex items-end gap-1"
                    dotClassName="size-1.5 rounded-full bg-[#9b9da3] inline-block"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[18px] bg-white px-3 py-2 text-[12px] text-[#8b8d92]">
                <span className="flex-1">Type a message</span>
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-[#0d6c60] text-white">
                  <ArrowUpRightIcon />
                </span>
              </div>
            </div>
          </TechnologyCard>
        </StaggerGroup>
      </Container>
    </section>
  );
}

function TalentEquationSection() {
  return (
    <section className="bg-white py-12">
      <Container>
        <div className="text-center">
          <SectionPill text="THE TALENT EQUATION" />
          <h2 className="mx-auto mt-8 max-w-[790px] font-[family-name:var(--font-gabarito)] text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[3.05rem]">
            The New Math of Hiring:{" "}
            <span className="text-[#ed1a24]">
              Artificial + Acquired Intelligence.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[820px] text-[18px] leading-[1.7] text-[#5f6166]">
            Merito combines global-scale AI with deep-rooted human insight to
            deliver the precision a standard recruitment agency can&apos;t match.
          </p>
        </div>

        <StaggerGroup className="mt-14 grid gap-6 lg:grid-cols-2" stagger={0.15}>
          {[
            {
              tag: "AI - Artificial Intelligence - Recruitment Efficiency",
              title: "Technology that automates the recruitment grind",
              body: "Our AI recruitment agency engine eliminates administrative lag by optimizing JD reach and automating multi-platform sourcing across India. We use a Skill-based Hiring Platform to filter for high-intent talent, ensuring your pipeline is built on performance rather than just resume keywords.",
            },
            {
              tag: "AI - Acquired Intelligence - Recruitment Effectiveness",
              title: "Human insight that predicts the right hire",
              body: "Our senior consultants provide the expert vetting needed to align elite candidates with your specific leadership and technical requirements. We go beyond simple CV screening to gather deep intelligence, ensuring you hire top talent with a precision that standard methods cannot match.",
            },
          ].map((card) => (
            <StaggerItem
              key={card.title}
              as="article"
              className="rounded-[24px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fafafa_100%)] px-8 py-8 shadow-[0_20px_60px_rgba(17,35,89,0.06)] transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="inline-flex rounded-[10px] border border-[#f4c4c6] bg-[#fff6f6] px-3 py-1 text-[13px] font-medium text-[#ed1a24]">
                {card.tag}
              </span>
              <h3 className="mt-5 font-[family-name:var(--font-gabarito)] text-[1.9rem] font-semibold leading-[1.04] text-black">
                {card.title}
              </h3>
              <p className="mt-5 text-[18px] leading-[1.8] text-[#595b60]">
                {card.body}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}

function PerformanceSection() {
  return (
    <section className="bg-white py-12">
      <Container>
        <div className="text-center">
          <h2 className="mx-auto max-w-[760px] font-[family-name:var(--font-gabarito)] text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[3.05rem]">
            Your Recruiter Is Trapped in Manual Work{" "}
            <span className="text-[#ed1a24]">
              Your Founder is Stuck in Interviews.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-[700px] text-[18px] leading-[1.7] text-[#5d5f65]">
            The efficiency gap between traditional hiring and the Merito
            AI-Driven model.
          </p>
          <div className="mt-8">
            <SectionPill text="PERFORMANCE METRICS" />
          </div>
        </div>

        <StaggerGroup
          className="mt-14 grid items-start gap-6 lg:grid-cols-3 lg:px-12"
          stagger={0.15}
        >
          {/* Card 1: Metric Labels */}
          <StaggerItem
            as="article"
            className="rounded-[24px] border border-black/8 bg-white px-8 py-8 shadow-[0_20px_60px_rgba(17,35,89,0.06)]"
          >
            <h3 className="flex h-12 items-center justify-center text-[22px] font-semibold text-black mb-8">Metric</h3>
            <div className="grid gap-0">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="flex h-14 items-center gap-4">
                  <span className="flex size-6 items-center justify-center text-[#35353a]">
                    {metric.icon}
                  </span>
                  <span className="text-[16px] font-semibold text-[#35353a] whitespace-nowrap">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* Card 2: Traditional Agencies */}
          <StaggerItem
            as="article"
            className="rounded-[24px] border border-[#f3d6d8] bg-white px-8 py-8 shadow-[0_20px_60px_rgba(17,35,89,0.06)]"
          >
            <div className="flex h-12 items-center justify-between gap-3 mb-8">
              <h3 className="text-[21px] font-semibold text-black leading-tight">
                Traditional Agencies
              </h3>
              <span className="rounded-full bg-[#fff3f4] px-3 py-1 text-[11px] font-bold text-[#ff8087]">
                OLD
              </span>
            </div>
            <div className="grid gap-0">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="flex h-14 items-center gap-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#f3d6d8] text-[14px] font-bold text-[#ed1a24]">
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </span>
                  <span className="text-[17px] font-bold text-[#4b4b4d]">
                    {metric.traditional}
                  </span>
                </div>
              ))}
            </div>
          </StaggerItem>

          {/* Card 3: Merito Way */}
          <StaggerItem
            as="article"
            className="relative overflow-hidden rounded-[24px] border border-[#d6f7e1] bg-white px-8 py-8 shadow-[0_20px_60px_rgba(17,35,89,0.06)]"
          >
            <div className="flex h-12 items-center justify-between gap-3 mb-8">
              <h3 className="text-[22px] font-semibold text-black tracking-tight">
                MERITO WAY
              </h3>
              <span className="rounded-full bg-[#eefdf1] px-3 py-1 text-[11px] font-bold text-[#40d36f]">
                NEW
              </span>
            </div>
            <div className="grid gap-0">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="flex h-14 items-center gap-4">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-[#40d36f]/30 text-[#40d36f]">
                    <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[17px] font-bold text-black">
                      {metric.merito}
                    </span>
                    {metric.change && (
                      <span className="flex items-center text-[14px] font-bold text-[#40d36f] whitespace-nowrap">
                        {metric.trend === 'down' ? '↓' : '↑'}{metric.change}
                      </span>
                    )}
                    {!metric.change && (
                      <span className="text-[14px] font-bold text-[#40d36f]">
                        ↑
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Accent corner */}
            <div className="absolute -bottom-1 -right-1 size-24 translate-x-4 translate-y-4 rounded-full bg-[#16a34a]/10 sm:block" />
            <div className="absolute bottom-0 right-0 h-16 w-16 overflow-hidden">
               <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[60px] border-l-[60px] border-b-[#16a34a] border-l-transparent" />
               <div className="absolute bottom-0 right-0 h-0 w-0 border-b-[40px] border-l-[40px] border-b-[#40d36f] border-l-transparent" />
            </div>
          </StaggerItem>
        </StaggerGroup>
      </Container>
    </section>
  );
}

function FAQSection() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  return (
    <section className="bg-white py-12">
      <Container className="max-w-[980px]">
        <h2 className="text-center font-[family-name:var(--font-gabarito)] text-[2.35rem] font-semibold leading-[1.06] tracking-[-0.035em] text-black sm:text-[2.9rem]">
          Frequently Asked Questions
        </h2>

        <div className="mt-12 border-t border-black/10">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.q}
              isOpen={activeFaq === faq.q}
              onToggle={() => setActiveFaq(activeFaq === faq.q ? null : faq.q)}
              className="border-b border-black/10"
              headerClassName="px-4 py-5"
              contentClassName="px-4"
              title={
                <span className="text-[18px] font-medium text-black">{faq.q}</span>
              }
            >
              <p className="max-w-[860px] pb-6 text-[16px] leading-[1.75] text-[#64666b]">
                {faq.a}
              </p>
            </AccordionItem>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CTASection() {
  const { openContact } = useContactModal();
  return (
    <section className="bg-white py-12 text-center">
      <Container className="max-w-[880px]">
        <RevealOnScroll>
          <SectionPill text="READY TO GROW?" />
          <h2 className="mt-8 font-[family-name:var(--font-gabarito)] text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.035em] text-black sm:text-[3.05rem]">
            Hire with <span className="text-[#ed1a24]">Conviction</span>
            <br />
            Not <span className="text-[#ed1a24]">Intuition</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[760px] text-[18px] leading-[1.75] text-[#52545b]">
            Stop guessing and start scaling. Book a{" "}
            <span className="font-semibold text-black">15-minute consultation</span>{" "}
            with our senior consultants to see how our Skill-based Hiring Platform
            can integrate with your team for immediate impact.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={openContact}
              className="mt-9 inline-flex min-h-[56px] items-center justify-center rounded-[10px] bg-[#ed1a24] px-9 text-[18px] font-semibold text-white shadow-[0_10px_30px_rgba(237,26,36,0.25)] transition-all duration-300 hover:scale-[1.04] hover:bg-[#c8151e] hover:shadow-[0_18px_40px_rgba(237,26,36,0.35)]"
            >
              Talk to an Expert
            </button>
            <p className="text-[14px] font-medium text-[#52545b]/80">
              No-risk consultation · Confidential discussion
            </p>
          </div>
        </RevealOnScroll>
      </Container>
    </section>
  );
}


export default function HomePage() {
  return (
    <main className="bg-white">
      <HeroSection />
      <MisconceptionSection />
      <SocialProofSection />
      <FullFunnelSection />
      <PropTechSection />
      <TalentEquationSection />
      <PerformanceSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
