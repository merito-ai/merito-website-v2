import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReputationToggle from "./ReputationToggle";
import VideoThumbnail from "@/components/VideoThumbnail";
import ContactTrigger from "@/components/ContactTrigger";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "OfferVault — Eliminate Offer Dropouts | Merito",
  description: "Merito OfferVault is a transparent offer exchange platform that eliminates candidate dropouts and improves offer-to-joining conversion. Stop losing candidates after the offer.",
  openGraph: {
    title: "OfferVault — Eliminate Offer Dropouts | Merito",
    description: "Stop losing candidates after the offer. OfferVault by Merito creates transparent offer exchanges that improve joining conversion rates.",
    url: getAbsoluteUrl("/offervault"),
  },
  alternates: {
    canonical: "/offervault",
  },
};

function Eyebrow({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center bg-[#ed1a24] px-[12px] py-[6px] rounded-full">
      <span className="font-[family-name:var(--font-poppins)] font-bold text-[16px] text-white leading-[165%]">
        {text}
      </span>
    </div>
  );
}

const problems = [
  {
    icon: "/offervault/icon-problem-1.svg",
    title: "Increase offer to Joining Ratio",
    desc: "Convert more offers into successful joinings into seamless offer experience",
    accent: "top",
  },
  {
    icon: "/offervault/icon-problem-2.svg",
    title: "Eliminate Offer Shopping",
    desc: "Leverage quantitative metrics and structured feedback to evaluate candidates objectively.",
    accent: "top",
  },
  {
    icon: "/offervault/icon-problem-3.svg",
    title: "Avoid Joining Delay",
    desc: "Ensure candidates join on time with better communication and proactive follow-ups.",
    accent: "bottom",
  },
];

const steps = [
  {
    num: "01",
    color: "#ed3c42",
    bg: "#fee9e8",
    icon: "/offervault/icon-step-1.svg",
    iconBg: "transparent",
    title: "Create New Offer",
    desc: "Add the offer details in the Offer Vault platform",
  },
  {
    num: "02",
    color: "#feb422",
    bg: "#fef4e2",
    icon: "/offervault/icon-step-2.svg",
    iconBg: "#fef4e2",
    title: "Upload Offer Letter",
    desc: "Upload a scanned copy of the offer letter and submit on the portal.",
  },
  {
    num: "03",
    color: "#07802a",
    bg: "#eaf5e6",
    icon: "/offervault/icon-step-3.svg",
    iconBg: "#eaf5e6",
    title: "Share with Candidate",
    desc: "Share a secure link with the candidate via email or message.",
  },
  {
    num: "04",
    color: "#0052de",
    bg: "#e3eefb",
    icon: "/offervault/icon-step-4.svg",
    iconBg: "#e3eefb",
    title: "Secure Viewing",
    desc: "Candidates can view the offer letter but cannot download it.",
  },
  {
    num: "05",
    color: "#661db3",
    bg: "#e3eefb",
    icon: "/offervault/icon-step-5.svg",
    iconBg: "#e3eefb",
    title: "Respond with Confidence",
    desc: "Candidates can accept, decline, or request changes to the offer.",
  },
  {
    num: "06",
    color: "#c60087",
    bg: "#ffddf4",
    icon: "/offervault/icon-step-6.svg",
    iconBg: "rgba(255,219,244,0.95)",
    title: "Dashboard",
    desc: "Dashboard to track the candidate actions and joining timelines.",
  },
];

export default function OfferVaultPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative mx-auto max-w-[1300px] px-5 pt-8">
        <div className="relative h-[220px] sm:h-[320px] md:h-[220px] sm:h-[320px] md:h-[422px] rounded-[11px] overflow-hidden">
          <Image
            src="/offer-vault/hero-banner.png"
            alt="Offer Vault"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/41" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-5 px-8">
            <Eyebrow text="OFFER VAULT" />
            <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] sm:text-[36px] md:text-[22px] sm:text-[36px] md:text-[48px] text-white leading-normal">
              Ideas That Shape the{" "}
              <span className="text-[#ed1a24]">Future of Talent.</span>
            </h1>
            <p className="font-semibold text-[12px] sm:text-[18px] md:text-[12px] sm:text-[18px] md:text-[24px] text-white leading-[165%] max-w-[800px]">
              Get all the latest on all things about Merito and the industry
            </p>
          </div>
        </div>
      </section>

      {/* Intro CTA */}
      <section className="w-full bg-[#fafafa]">
        <div className="max-w-[1115px] mx-auto px-5 py-12 flex flex-col items-center gap-6 text-center">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[22px] md:text-[32px] text-black">
            No more offer Backouts
          </h2>
          <p className="text-[16px] text-[#4b4b4d] leading-[165%] max-w-[700px]">
            OfferVault helps you in ensuring guaranteed smooth offer process.
          </p>
          <div className="flex flex-col items-center gap-3">
            <ContactTrigger
              className="bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[16px] h-[50px] px-8 rounded-[8px] flex items-center justify-center transition-all duration-200 hover:bg-black hover:text-white hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] active:scale-[0.97]"
            >
              REGISTER NOW
            </ContactTrigger>
            <p className="text-[14px] font-medium text-[#6d6f74]/70">
              Free setup · No-risk consultation
            </p>
          </div>
        </div>
      </section>

      {/* Offer Vault Showcase */}
      <section className="max-w-[1000px] mx-auto px-5 py-12">
        <div className="relative w-full aspect-video rounded-[12px] overflow-hidden shadow-2xl">
          <VideoThumbnail
            videoSrc="/offer-vault/intro.mp4"
            thumbnailSrc="/offer-vault/intro.webp"
            alt="Offer Vault Platform"
          />
        </div>
      </section>

      {/* Problem Cards */}
      <section className="w-full border-t border-[#f0f0f0]">
        <div className="max-w-[1136px] mx-auto px-5 py-12 flex flex-col gap-[60px]">
          <div className="flex flex-col items-center gap-5 text-center">
            <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[22px] md:text-[32px] text-black">
              Frequent Last-minute Backouts?
            </h2>
            <p className="text-[16px] text-[#4b4b4d] leading-[165%] max-w-[800px]">
              The study shows there are more than 40% candidates backouts post offer. Offer-vault helps you to overcome this challenge.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-[40px] justify-items-center">
            {problems.map((p, i) => (
              <div
                key={p.title}
                className={`${i === 2 ? "md:col-span-2" : ""} bg-white border-[#ed1a24] ${p.accent === "top" ? "border-t" : "border-b"} rounded-[12px] shadow-[0px_10px_30px_rgba(0,0,0,0.08)] overflow-hidden w-full max-w-[543px] min-h-[199px] flex flex-col sm:flex-row items-center gap-8 p-8 transition-transform hover:-translate-y-1`}
              >
                <div className="size-[98px] bg-white rounded-full shadow-[0px_4px_20px_rgba(0,0,0,0.1)] flex items-center justify-center flex-shrink-0">
                  <Image src={p.icon} alt={p.title} width={55} height={55} unoptimized />
                </div>
                <div className="flex flex-col gap-3 text-center sm:text-left">
                  <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[20px] text-black">{p.title}</h3>
                  <p className="text-[16px] text-[#4b4b4d] leading-[155%]">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-[#fef7f3] py-12">
        <div className="max-w-[1282px] mx-auto px-5 flex flex-col gap-[50px]">
          <div className="flex flex-col items-center gap-5 text-center">
            <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[22px] md:text-[32px] text-black">
              How it works?
            </h2>
            <p className="text-[16px] text-[#4b4b4d] leading-[165%] max-w-[700px]">
              Offer Vault simplifies offer management between employers and candidates, bringing accountability and reducing dropouts.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Steps */}
            <div className="flex gap-4 lg:gap-[56px] items-start flex-shrink-0">
              {/* Number dots + line */}
              <div className="flex flex-col gap-[14px] relative">
                {/* single connector line behind the cells */}
                <div className="pointer-events-none absolute left-1/2 top-[25px] bottom-[25px] w-px -translate-x-1/2 bg-[#ed1a24]/30" />
                {steps.map((step) => (
                  <div
                    key={step.num}
                    className="relative min-h-[118px] flex items-center justify-center"
                  >
                    <div
                      className="size-[50px] rounded-full flex items-center justify-center font-[family-name:var(--font-poppins)] font-medium text-[18px] flex-shrink-0 relative"
                      style={{ background: step.bg, color: step.color }}
                    >
                      {step.num}
                    </div>
                  </div>
                ))}
              </div>
              {/* Step cards */}
              <div className="flex flex-col gap-[14px] flex-1 min-w-0">
                {steps.map((step) => (
                  <div
                    key={step.num}
                    className="bg-white rounded-[7px] flex gap-[16px] lg:gap-[30px] min-h-[118px] items-center pl-[12px] lg:pl-[20px] pr-[12px] lg:pr-[44px] py-[12px] lg:py-[17px]"
                  >
                    <div
                      className="size-[77px] rounded-[10px] flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: step.iconBg }}
                    >
                      <Image src={step.icon} alt={step.title} width={44} height={44} unoptimized />
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="font-[family-name:var(--font-poppins)] font-bold text-[15px] lg:text-[18px] text-black">{step.title}</h3>
                      <p className="text-[13px] lg:text-[15px] text-[#3c3f45] leading-[155%]">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar callout */}
            <div className="bg-[#fdf0ec] rounded-[12px] p-[24px] flex flex-col gap-5 flex-1">
              <div className="flex gap-4 items-start">
                <Image
                  src="/offervault/icon-alert.svg"
                  alt="Alert"
                  width={39}
                  height={39}
                  unoptimized
                />
                <p className="font-[family-name:var(--font-poppins)] font-medium text-[16px] text-black leading-[155%]">
                  Merito&apos;s Offer Vault is an innovative way to exchange offer letters between employers and candidates to bring accountability in the offer process and reduce offer dropouts
                </p>
              </div>
              <div className="relative h-[292px] w-full rounded-[8px] overflow-hidden">
                <VideoThumbnail
                  videoSrc="/offer-vault/process.mp4"
                  thumbnailSrc="/offer-vault/process.webp"
                  alt="Offer Vault Process"
                />
              </div>
            </div>
          </div>

          {/* Green highlight */}
          <div className="bg-[#eaf5e6] rounded-[10px] flex flex-col sm:flex-row gap-[40px] items-center px-5 sm:-[40px] items-center px-5 sm:px-[60px] py-[20px]">
            <Image
              src="/offervault/icon-sparkle.svg"
              alt="Sparkle"
              width={54}
              height={54}
              unoptimized
            />
            <p className="font-[family-name:var(--font-poppins)] font-semibold text-[16px] sm:text-[20px] text-black leading-[155%] text-center sm:text-left leading-[155%] text-center sm:text-left">
              A transparent process. A better candidate experience. Higher offer acceptance.
            </p>
          </div>
        </div>
      </section>

      {/* Reputation Index */}
      <section className="max-w-[1200px] mx-auto px-5 py-12 flex flex-col gap-[50px]">
        <div className="flex flex-col items-center gap-5 text-center">
          <Eyebrow text="IMPACT" />
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[22px] md:text-[32px] text-black">
            Introducing Reputation Index
          </h2>
          <p className="text-[16px] text-[#4b4b4d] leading-[165%] max-w-[800px]">
            To Bring Accountability in the Offer Process, both employer and candidate&apos;s reputation index are maintained.
          </p>
        </div>
        <ReputationToggle />
      </section>

      {/* Reputation Index Video */}
      <section className="bg-[#fef7f3] py-12">
        <div className="max-w-[1200px] mx-auto px-5 flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5 text-center">
            <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[22px] md:text-[32px] text-black">
              How Reputation Index Works
            </h2>
            <p className="text-[16px] text-[#4b4b4d] leading-[165%] max-w-[800px]">
              Understand how the reputation index system brings transparency and accountability to every offer.
            </p>
          </div>
          <div className="relative h-[450px] w-full max-w-[900px] rounded-[12px] overflow-hidden">
            <VideoThumbnail
              videoSrc="/offer-vault/rep-index.mp4"
              thumbnailSrc="/offer-vault/rep-index.webp"
              alt="Reputation Index"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1115px] mx-auto px-5 py-12 flex flex-col items-center gap-[25px] text-center">
        <div className="flex flex-col gap-5">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[22px] md:text-[32px] text-black">
            Get started with Merito
          </h2>
          <p className="text-[16px] text-[#4b4b4d] leading-[165%]">
            Help us with what you are looking for and our team will get in-touch to understand your talent requirements
          </p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <ContactTrigger
            className="bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[16px] h-[50px] px-8 rounded-[8px] flex items-center justify-center transition-all duration-200 hover:bg-black hover:text-white hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] active:scale-[0.97]"
          >
            CONTACT US
          </ContactTrigger>
          <p className="text-[14px] font-medium text-[#6d6f74]/70">
            No-risk consultation · 100% confidential
          </p>
        </div>
      </section>
    </main>
  );
}
