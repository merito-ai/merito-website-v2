import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactTrigger from "@/components/ContactTrigger";
import { getAbsoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Merito — Human-Centric AI Recruitment Agency India",
  description: "Merito is India's human-centric AI recruitment agency. We combine artificial intelligence with acquired human expertise to deliver precise, fast hiring for growth companies. Meet the team.",
  openGraph: {
    title: "About Merito — Human-Centric AI Recruitment Agency India",
    description: "Meet the team behind India's human-centric AI recruitment agency. AI + Acquired Intelligence = top 2% talent in 48 hours.",
    url: getAbsoluteUrl("/about"),
  },
  alternates: {
    canonical: "/about",
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

const values = [
  {
    iconSrc: "/about-us-audit/identity.svg",
    title: "Identity",
    desc: "We believe each individual and organization is unique and capable of achieving excellence.",
  },
  {
    iconSrc: "/about-us-audit/innovation.svg",
    title: "Innovation",
    desc: "We believe in innovation in talent services by providing new and creative solutions.",
  },
  {
    iconSrc: "/about-us-audit/Intelligence.svg",
    title: "Intelligence",
    desc: "We adhere to the highest ethical standards in all of our actions and decisions.",
  },
  {
    iconSrc: "/about-us-audit/integrity.svg",
    title: "Integrity",
    desc: "We adhere to the highest ethical standards in all of our actions and decisions.",
  },
  {
    iconSrc: "/about-us-audit/inclusivity.svg",
    title: "Inclusivity",
    desc: "We believe in inclusivity and diversity and committed to providing equal opportunities to all individuals.",
  },
];

const foundingTeam = [
  { name: "Rushikesh Humbe", role: "Founder", img: "/about-us-audit/founder-image.png" },
  { name: "Urmila Humbe", role: "CoFounder", img: "/Urmila Humbe.jpeg" },
  { name: "Sneha Priya", role: "Head Recruitment Delivery", img: "/Sneha Priya.jpeg" },
];

const recruitmentTeam = [
  { name: "Sharayu Salunke", img: "/Sharayu Salunke.png" },
  { name: "Anish Wategaonkar", img: "/Anish Wategaonkar.jpeg" },
  { name: "Simran Kewlani", img: "/Simran Kewlani.png" },
  { name: "Anushka Bhasin", img: "/Anushka Bhasin.jpeg" },
  { name: "Trisha Thatipamula", img: "/Trisha Thatipamula.jpeg" },
];

export default function AboutPage() {
  return (
    <main className="bg-[#fdf8fb]">
      {/* Hero banner */}
      <section className="relative mx-auto max-w-[1300px] px-5 pt-8">
        <div className="relative h-[220px] sm:h-[320px] md:h-[422px] rounded-[11px] overflow-hidden">
          <Image 
            src="/about-us-audit/hero-banner.png" 
            alt="Our Approach Your Advantage" 
            fill 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-5">
            <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[26px] sm:text-[38px] md:text-[48px] text-white leading-normal">
              Our Approach
              <br />
              <span className="text-[#ed1a24]">Your Advantage</span>
            </h1>
            <p className="font-semibold text-[13px] sm:text-[18px] md:text-[24px] text-[#d9d9d9] leading-[165%]">
              Discover how Merito turns vision into measurable impact
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-[1300px] mx-auto px-5 py-12 flex flex-col gap-[50px]">
        <div className="flex flex-col items-center gap-5">
          <Eyebrow text="OUR STORY" />
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black text-center">
            The Merito Story
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-[114px] items-start">
          {/* Story text */}
          <div className="flex flex-col gap-5 font-[family-name:var(--font-poppins)] font-medium text-[20px] text-[#4b4b4d] leading-[155%] flex-1">
            <p>
              Merito began with Career Corner Education, built on a simple belief: people unlock
              their potential when given the right opportunities. What started as a vision to guide
              individuals soon grew into something bigger — a trusted partner for companies looking
              to hire quality talent faster.
            </p>
            <p>
              As we worked closely with clients, we realized hiring needed more than just resumes
              and interviews. That insight led to ICE, our In-Depth Capability Assessment, where
              Assessments and Interviews became the foundation of how we identified the right
              talent. It was our way of bringing more clarity, confidence, and precision to hiring.
            </p>
            <p>
              Then AI changed the game, and so did we. Merito evolved into Merito.ai, a platform
              where Artificial Intelligence meets Acquired Intelligence, blending technology with
              human judgment to make hiring smarter without losing the human touch. Along the way,
              we built RAMP and introduced tools like Offer Vault and Ref-Track to make the entire
              hiring journey smoother, faster, and more seamless for our clients.
            </p>
          </div>

          {/* Timeline */}
          <div className="w-full md:w-[350px] flex-shrink-0 flex justify-center">
            <Image 
              src="/about-us-audit/timeline.png" 
              alt="Merito Story Timeline" 
              width={350} 
              height={450} 
              className="w-full h-auto object-contain" 
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="max-w-[1222px] mx-auto px-5 py-12 flex flex-col gap-[50px]">
        <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black text-center w-full">
          Our Vision and Mission
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[70px]">
          {[
            {
              label: "Merito&apos;s Mission",
              quote: '"To empower individuals and organizations to reach their full potential through exceptional talent services"',
              body: "We believe every individual deserves the right opportunity and every organization deserves the right talent. By combining human insight with AI intelligence, we bridge that gap at scale.",
              iconBg: "bg-black",
              iconSrc: "/about-us-audit/Merito's Mission.svg",
            },
            {
              label: "Merito&apos;s Vision",
              quote: '"To become a leader in talent services that enable individual and organization growth"',
              body: "We envision a world where talent is never wasted & potential is never overlooked. Through technology & empathy, Merito aims to redefine what's possible in talent acquisition & development.",
              iconBg: "bg-[#ed1a24]",
              iconSrc: "/about-us-audit/Meritos vision.svg",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="group relative bg-white border border-white/8 rounded-[20px] shadow-[0px_0px_128.7px_2px_rgba(0,0,0,0.25)] hover:shadow-[0px_0px_128.7px_2px_rgba(237,26,36,0.15)] hover:-translate-y-2 transition-all duration-300 p-5 md:p-[43px] flex flex-col gap-6 overflow-hidden"
            >
              {/* Hover Left Red Bar */}
              <div className="absolute inset-y-0 left-0 w-1.5 group-hover:w-3 bg-[#ed1a24] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              
              <div className={`size-[69px] rounded-[6px] ${card.iconBg} group-hover:bg-[#ed1a24] transition-colors flex items-center justify-center`}>
                <div className="relative size-full">
                  <Image src={card.iconSrc} alt={card.label} fill className="object-contain" unoptimized />
                </div>
              </div>
              <div className="flex flex-col gap-4 relative z-10">
                <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[22px] md:text-[32px] text-black"
                    dangerouslySetInnerHTML={{ __html: card.label }} />
                <p className="font-semibold italic text-[18px] text-[#4b4b4d] leading-[146.8%]">{card.quote}</p>
              </div>
              <p className="font-[family-name:var(--font-poppins)] text-[16px] text-[#4b4b4d] leading-[155%] relative z-10">{card.body}</p>
              <div className="h-[10px] w-[22px] rounded-full bg-[#ed1a24]/25 group-hover:bg-[#ed1a24] transition-colors relative z-10" />
            </div>
          ))}
        </div>
      </section>

      {/* Values — 5I's */}
      <section className="max-w-[1193px] mx-auto px-5 py-12 flex flex-col gap-[50px]">
        <div className="flex flex-col items-center gap-5">
          <Eyebrow text="VALUES" />
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black text-center">
            Our Values <span className="text-[#ed1a24]">(5I&apos;s)</span>
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-[30px]">
          {values.map((v) => (
            <div key={v.title} className="group bg-white rounded-[7px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-[31px] flex flex-col gap-4 relative overflow-hidden w-full md:w-[calc(50%-15px)] lg:w-[calc(33.333%-20px)]">
              {/* Red corner triangle */}
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[48px] border-t-[#ed1a24] border-l-[48px] border-l-transparent" />
              <div className="size-[49px] bg-[#ed1a24] rounded-[6px] flex items-center justify-center shadow-[0_4px_12px_rgba(237,26,36,0.35)]">
                <div className="relative size-full">
                  <Image src={v.iconSrc} alt={v.title} fill className="object-contain" unoptimized />
                </div>
              </div>
              <h3 className="font-[family-name:var(--font-poppins)] font-bold text-[18px] text-black relative z-10">{v.title}</h3>
              <p className="text-[13px] text-[#4b4b4d] leading-[155%] relative z-10">{v.desc}</p>
              <div className="mt-auto pt-2 relative z-10">
                <div className="h-[9px] w-[25px] rounded-full bg-[#ed1a24]/20 group-hover:bg-[#ed1a24] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founding Team */}
      <section className="max-w-[1218px] mx-auto px-5 py-12 flex flex-col gap-[50px]">
        <div className="flex flex-col items-center gap-5">
          <Eyebrow text="OUR TEAM" />
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black text-center">Know Our Team</h2>
          <p className="font-semibold text-[20px] text-black text-center">Founding Team</p>
        </div>

        <div className="flex flex-col gap-[50px] items-center w-full">
          {/* Founders row */}
          <div className="flex gap-[40px] md:gap-[60px] items-start flex-wrap justify-center">
            {foundingTeam.slice(0, 2).map((m) => (
              <div key={m.name} className="bg-[#f2f2f2] rounded-[7px] shadow-[0px_4px_15px_rgba(0,0,0,0.05)] overflow-hidden w-[310px]">
                <div className="p-4 pb-0">
                  <div className="relative w-full h-[330px] rounded-[4px] overflow-hidden">
                    <Image src={m.img} alt={m.name} fill className="object-cover object-top" sizes="(max-width: 768px) 50vw, 280px" />
                  </div>
                </div>
                <div className="py-5 text-center bg-[#f2f2f2]">
                  <p className="font-semibold text-[22px] text-black">{m.name}</p>
                  <p className="font-semibold text-[18px] text-[#ed1a24] mt-1">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Head */}
          {foundingTeam.slice(2).map((m) => (
            <div key={m.name} className="bg-[#f2f2f2] rounded-[7px] shadow-[0px_4px_15px_rgba(0,0,0,0.05)] overflow-hidden w-[310px]">
              <div className="p-4 pb-0">
                <div className="relative w-full h-[330px] rounded-[4px] overflow-hidden">
                  <Image src={m.img} alt={m.name} fill className="object-cover object-top" sizes="(max-width: 768px) 50vw, 280px" />
                </div>
              </div>
              <div className="py-5 text-center bg-[#f2f2f2]">
                <p className="font-semibold text-[22px] text-black">{m.name}</p>
                <p className="font-semibold text-[18px] text-[#ed1a24] mt-1">{m.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recruitment team */}
        <div className="flex flex-col gap-[70px] items-center w-full mt-8">
          <h3 className="font-semibold text-[32px] text-black text-center">Meet our Team</h3>
          <div className="flex gap-[40px] md:gap-[50px] items-center flex-wrap justify-center">
            {recruitmentTeam.map((m) => (
              <div key={m.name} className="bg-[#f2f2f2] rounded-[5px] shadow-[0px_4px_15px_rgba(0,0,0,0.05)] overflow-hidden w-[260px]">
                <div className="p-4 pb-0">
                  <div className="relative w-full h-[280px] rounded-[3px] overflow-hidden">
                    <Image src={m.img} alt={m.name} fill className="object-cover object-top" sizes="(max-width: 768px) 50vw, 280px" />
                  </div>
                </div>
                <div className="py-4 text-center bg-[#f2f2f2]">
                  <p className="font-semibold text-[18px] text-black">{m.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1115px] mx-auto px-5 py-12 flex flex-col items-center gap-[25px] text-center">
        <div className="flex flex-col gap-5 w-full">
          <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black">Get started with Merito</h2>
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
