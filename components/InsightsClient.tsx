"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function Eyebrow({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center bg-[#ed1a24] px-[12px] py-[6px] rounded-full">
      <span className="font-[family-name:var(--font-poppins)] font-bold text-[16px] text-white leading-[165%]">
        {text}
      </span>
    </div>
  );
}

interface Article {
  slug: string;
  category: string;
  titleBefore: string;
  titleRed: string;
  excerpt: string;
  tagline: string;
  thumbnail: string;
  thumbnailContain?: boolean;
}

interface Podcast {
  slug: string;
  episode: string;
  titleBefore: string;
  titleRed: string;
  thumbnail: string;
}

function ArticleCard({ slug, category, titleBefore, titleRed, excerpt, tagline, thumbnail, thumbnailContain }: Article) {
  return (
    <Link href={`/insights/${slug}`} className="relative block bg-[#e7e7e7] rounded-[7px] overflow-hidden h-[484px] group">
      <div className="absolute top-[22px] left-[24px] h-[6px] bg-[#ed1a24] z-20 w-[62px] group-hover:w-[calc(100%-48px)] transition-all duration-300" />
      <div className={`absolute top-[10px] left-[10px] right-[10px] h-[201px] rounded-[5px] overflow-hidden relative${thumbnailContain ? ' bg-black' : ''}`}>
        <Image src={thumbnail} alt={titleBefore} fill sizes="(max-width: 768px) 100vw, 362px" className={thumbnailContain ? 'object-contain p-4' : 'object-cover'} unoptimized priority />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-[38px] left-[24px] flex items-center gap-[6px] z-10">
          <div className="w-[4px] h-[14px] bg-[#ed1a24] flex-shrink-0" />
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-[13px] text-white tracking-wide">{category}</span>
        </div>
      </div>
      <div className="absolute top-[219px] left-[10px] right-[10px] bottom-[10px] bg-white rounded-b-[5px] rounded-t-[3px]" />
      <div className="absolute left-[32px] right-[18px] top-[234px] z-10">
        <h3 className="font-[family-name:var(--font-poppins)] font-bold text-[22px] leading-[120%] text-black">
          {titleBefore} <span className="text-[#ed1a24] underline decoration-[#ed1a24]">{titleRed}</span>
        </h3>
      </div>
      <div className="absolute left-[32px] right-[18px] top-[320px] z-10">
        <p className="text-[12px] text-[#4b4b4d] leading-[175%] line-clamp-3">{excerpt}</p>
      </div>
      <div className="absolute top-[410px] left-[10px] right-[10px] h-px bg-gray-200 z-10" />
      <div className="absolute top-[426px] left-[32px] right-[18px] flex items-center justify-between z-10">
        <span className="text-[9px] font-extrabold tracking-[0.5px] text-black uppercase leading-[150%] w-[55%] line-clamp-2">{tagline}</span>
        <span className="text-[10px] font-extrabold tracking-[0.6px] text-[#ed1a24] whitespace-nowrap group-hover:underline">Read More →</span>
      </div>
    </Link>
  );
}

function PodcastCard({ slug, episode, titleBefore, titleRed, thumbnail }: Podcast) {
  return (
    <Link href={`/insights/${slug}`} className="relative flex flex-col bg-[#e7e7e7] rounded-[7px] overflow-hidden group h-full min-h-[340px]">
      <div className="absolute top-[22px] left-[24px] h-[6px] bg-[#ed1a24] z-20 w-[62px] group-hover:w-[calc(100%-48px)] transition-all duration-300" />
      <div className="mx-[10px] mt-[10px] h-[220px] rounded-[5px] overflow-hidden relative flex-shrink-0">
        <Image src={thumbnail} alt={titleBefore} fill sizes="(max-width: 768px) 100vw, 362px" className="object-cover" unoptimized priority />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-[38px] left-[24px] flex items-center gap-[6px] z-10">
          <div className="w-[4px] h-[14px] bg-[#ed1a24] flex-shrink-0" />
          <span className="font-[family-name:var(--font-poppins)] font-semibold text-[13px] text-white tracking-wide">Podcast</span>
        </div>
        <span className="absolute bottom-4 left-5 text-[11px] font-bold text-white/70 tracking-[2px]">{episode}</span>
      </div>
      <div className="mx-[10px] mb-[10px] bg-white rounded-b-[5px] rounded-t-[3px] flex flex-col flex-1">
        <div className="px-[22px] pt-[18px] pb-[14px] flex-1">
          <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[20px] leading-[130%]">
            <span className="text-black">{titleBefore} </span>
            <span className="text-[#ed1a24]">{titleRed}</span>
          </h3>
        </div>
        <div className="h-px bg-gray-200 mx-0" />
        <div className="px-[22px] py-[14px]">
          <span className="text-[10px] font-extrabold tracking-[0.6px] text-[#ed1a24] whitespace-nowrap group-hover:underline">Read More →</span>
        </div>
      </div>
    </Link>
  );
}

const articles: Article[] = [
  { slug: "invisible-burn", category: "AI Recruitment", titleBefore: "The Invisible", titleRed: "Burn", excerpt: "How an AI Recruitment Agency Slashes Startup Hiring Gap by 40%. The silent cost of bad hiring decisions compounds over time.", tagline: "Bad Hiring is Invisible - Until it Isn't", thumbnail: "/insights-thumbnails/The invisible burn.png" },
  { slug: "human-centric-ai", category: "AI Recruitment", titleBefore: "Human Centric", titleRed: "AI", excerpt: "How a Human-Centric AI Recruitment Agency is Solving the Startup Hiring Gap with empathy and intelligence.", tagline: "The Right Hire Isn't Just Fast - It's Human", thumbnail: "/insights-thumbnails/Merito Logo 1.png", thumbnailContain: true },
  { slug: "right-path", category: "Hiring Strategy", titleBefore: "How to Choose", titleRed: "The Right Path", excerpt: "Recruitment Agency vs Specialized Agency — Your Business Hiring Decision.", tagline: "Not All Agencies Are Built for the Way Modern Business Hire", thumbnail: "/insights-thumbnails/How to choose the right path.png" },
  { slug: "choose-right", category: "Hiring Strategy", titleBefore: "How to Choose", titleRed: "Right", excerpt: "Four mental models that separate good hiring decisions from reactive ones.", tagline: "Don't Hire An Any Agency, Hire the Right One", thumbnail: "/insights-thumbnails/How to choose right.png" },
  { slug: "ditch-internal", category: "Hiring Strategy", titleBefore: "Ditch Internal", titleRed: "Specialise", excerpt: "If you're growing at speed, stop trying to be a Specialized Agency. Know when to hand the baton.", tagline: "Stay Lean . Hire Smart . Grow Faster .", thumbnail: "/insights-thumbnails/Dutch Internal specialise.jpg" },
  { slug: "retain-top-1", category: "Executive Search", titleBefore: "Retain the Top", titleRed: "1%", excerpt: "Executive Search Partners who keep Recruiting you with data, strategy, and deep talent networks that compound.", tagline: "The Best Talent Never Needs a Ranking to Prove It", thumbnail: "/insights-thumbnails/retain-top-1.png" },
  { slug: "modern-playbook", category: "Talent Strategy", titleBefore: "The Modern", titleRed: "Playbook", excerpt: "What the best companies do differently when attracting and retaining top-tier talent in 2025.", tagline: "In a High-Churn Market, the Playbook is Everything", thumbnail: "/insights-thumbnails/The modern playbook.jpg" },
  { slug: "slow-hiring-costs", category: "Hiring Strategy", titleBefore: "Slow Hiring", titleRed: "Costs You", excerpt: "Every week a role sits open is revenue lost. Here's how to quantify the real cost of slow hiring.", tagline: "Every Extra Round is a Candidate Walking Out the Door", thumbnail: "/insights-thumbnails/Slow hiring costs you.jpg" },
  { slug: "strategy-2026", category: "Talent Strategy", titleBefore: "Your 2026", titleRed: "Strategy", excerpt: "The talent landscape is shifting. Here's how forward-thinking companies are positioning for the year ahead.", tagline: "2026 Won't Wait, Nor Should Your Hiring Strategy", thumbnail: "/insights-thumbnails/Your 2026 stratergy.jpg" },
  { slug: "hire-from-within", category: "Executive Search", titleBefore: "Hire From", titleRed: "Within", excerpt: "Internal mobility done right. When promoting from within beats external search — and when it doesn't.", tagline: "The Right Hire Feels Like They Were Always There", thumbnail: "/insights-thumbnails/hire from within.jpg" },
  { slug: "rest-to-reality", category: "AI Recruitment", titleBefore: "From Rest to", titleRed: "Reality", excerpt: "How AI moves from experimental tool to core hiring infrastructure — a practical roadmap for talent teams.", tagline: "The Best Hire is the One You Never Have to Replace", thumbnail: "/insights-thumbnails/From rest to reality.jpg" },
  { slug: "resume-is-dead", category: "Hiring Strategy", titleBefore: "The Old Resume", titleRed: "Is Dead", excerpt: "The traditional resume filters out exactly the people you want. What to use instead and why it works.", tagline: "Hiring Strategy · 6 Min Read", thumbnail: "/insights-thumbnails/The old resume is dead.jpg" },
  { slug: "degree-doesnt-define", category: "Talent Strategy", titleBefore: "Degree Doesn't", titleRed: "Define It", excerpt: "Skills-based hiring isn't a trend — it's a correction. How top companies are rethinking qualifications.", tagline: "Talent Strategy · 5 Min Read", thumbnail: "/insights-thumbnails/DEgree doesn't define it.jpg" },
];

const podcasts: Podcast[] = [
  { slug: "acquired-intelligence-talent", episode: "Ep. 01", titleBefore: "Acquired Intelligence for", titleRed: "Talent Problems", thumbnail: "/insights-thumbnails/Acquired Intelligence for talent problems.png" },
  { slug: "recruitment-as-sales", episode: "Ep. 02", titleBefore: "Think of Recruitment", titleRed: "as Sales", thumbnail: "/insights-thumbnails/Think of recruitment as sales.png" },
  { slug: "ice-in-hiring", episode: "Ep. 03", titleBefore: "Do you have ICE in your", titleRed: "Hiring?", thumbnail: "/insights-thumbnails/Do you have ICE in  your hiring.png" },
  { slug: "improve-hiring-experience", episode: "Ep. 04", titleBefore: "What companies can do to improve", titleRed: "Hiring Experience", thumbnail: "/insights-thumbnails/what companies can do to improve.png" },
];

export default function InsightsClient() {
  const [visibleCount, setVisibleCount] = useState(6);

  return (
    <main className="bg-[#fdf8fb]">
      <section className="relative mx-auto max-w-[1300px] px-5 pt-8">
        <div
          className="relative min-h-[380px] md:min-h-[440px] rounded-[18px] overflow-hidden flex flex-col items-center justify-center text-center px-8"
          style={{ backgroundImage: "url('/insights-thumbnails/insight-Hero Banner.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#2d0a0c]/80" />
          <div className="relative z-10 flex flex-col items-center gap-6 w-full h-full justify-center">
            <Eyebrow text="INSIGHTS & RESOURCES" />
            <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[44px] md:text-[60px] text-white leading-tight">
              Ideas That Shape the Future<br className="hidden md:block" />of Talent
            </h1>
            <p className="font-medium text-[18px] md:text-[22px] text-[#d9d9d9] leading-[165%] max-w-[700px]">
              Get all the latest on all things about Merito and the industry
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1300px] mx-auto px-5 py-24 flex flex-col gap-[40px]">
        <div className="flex flex-col items-center gap-4"><Eyebrow text="ARTICLES" /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {articles.slice(0, visibleCount).map((a) => <ArticleCard key={a.slug} {...a} />)}
        </div>
        {visibleCount < articles.length && (
          <div className="flex justify-center pt-4">
            <button onClick={() => setVisibleCount(visibleCount + 3)} className="bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[15px] h-[48px] px-10 rounded-[8px] hover:bg-[#c8151e] transition-colors">
              Load more
            </button>
          </div>
        )}
      </section>

      <section className="bg-black py-24">
        <div className="max-w-[1300px] mx-auto px-5 flex flex-col gap-[50px]">
          <div className="flex flex-col items-center gap-4"><Eyebrow text="PODCAST" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {podcasts.map((p) => <PodcastCard key={p.slug} {...p} />)}
          </div>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-5 py-24 flex flex-col items-center gap-[25px] text-center">
        <h2 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black">Want insights delivered to you?</h2>
        <p className="text-[16px] text-[#4b4b4d] leading-[165%]">We write about talent, AI, and the future of hiring. No spam — just signal.</p>
        <div className="flex gap-3 w-full max-w-[480px]">
          <input type="email" placeholder="Enter your email" className="flex-1 h-[50px] px-4 rounded-[8px] border border-gray-200 text-[15px] focus:outline-none focus:border-[#ed1a24] bg-white" />
          <button className="bg-[#ed1a24] text-white font-semibold text-[15px] h-[50px] px-6 rounded-[8px] hover:bg-[#c8151e] transition-colors whitespace-nowrap">Subscribe</button>
        </div>
      </section>
    </main>
  );
}
