import Link from "next/link";
import Image from "next/image";

const articleData: Record<string, {
  title: string;
  titleBefore?: string;
  titleRed?: string;
  excerpt?: string;
  heroImage?: string;
  category: string;
  type: "article" | "podcast";
  readTime?: string;
  duration?: string;
  episode?: string;
  stats?: { value: string; label: string }[];
  content: string[];
}> = {
  "invisible-burn": {
    title: "The Invisible Burn: How an AI Recruitment Agency Slashes Startup Hiring Gap by 40%",
    titleBefore: "THE INVISIBLE",
    titleRed: "BURN",
    excerpt: "How an AI Recruitment Agency Slashes Startup Hiring Gap by 40%.",
    heroImage: "/insights-thumbnails/The invisible burn.png",
    category: "AI RECRUITMENT",
    type: "article",
    readTime: "7 min read",
    stats: [
      { value: "40%", label: "LOWER HIRING SPEND" },
      { value: "3x", label: "FASTER HIRING" },
      { value: "ICE ASSESSMENT", label: "INCLUDED" },
    ],
    content: [
      "Startup hiring burns slow. It's rarely a single catastrophic failure — it's the accumulation of small inefficiencies, each one invisible on its own. A two-week delay in sourcing. A misaligned hiring brief. Three rounds of interviews that end in a withdrawn offer. By the time you notice the damage, you've lost months and missed the window for critical growth.",
      "This is what we call the Invisible Burn — the compounding cost of treating recruitment as a reactive, ad-hoc function rather than a strategic capability.",
      "AI-powered recruitment agencies are solving this with a fundamentally different approach: instead of filling requisitions, they run parallel talent pipelines, pre-screen at scale using AI models trained on industry-specific success criteria, and deliver shortlists in 48 hours instead of 3 weeks.",
      "The result for startups is a 40% reduction in cost-per-hire and a 3x improvement in time-to-productivity — not because they hired faster, but because they hired better. Fewer missteps. Fewer re-hires. Less Invisible Burn.",
      "The first step is recognizing that the burn is real, even when it doesn't show up on a P&L. Talent gaps compound. Every week a key role sits open is a week of missed output, team stress, and delayed roadmap. The companies that treat hiring as a strategic priority — resourcing it properly and measuring it rigorously — consistently outperform those that don't.",
    ],
  },
  "human-centric-ai": {
    title: "How a Human-Centric AI Recruitment Agency Is Solving the Startup Hiring Gap",
    titleBefore: "HUMAN CENTRIC",
    titleRed: "AI",
    excerpt: "How a Human-Centric AI Recruitment Agency is Solving the Startup Hiring Gap.",
    heroImage: "/insights-thumbnails/Human centric AI.png",
    category: "AI RECRUITMENT",
    type: "article",
    readTime: "6 min read",
    stats: [
      { value: "72%", label: "of startups struggle to hire the right talent at scale" },
      { value: "ICE 2x", label: "evaluation" },
      { value: "2x", label: "better retention" },
    ],
    content: [
      "In the high-velocity world of startups, hiring often operates in survival mode — reactive, rushed, and rarely precise. Companies frequently default to casting a wide net, leveraging their networks, and hoping someone decent shows up. The result? High turnover, role mismatches, and a perpetual hiring cycle that drains resources and momentum.",
      "A Human-Centric AI recruitment agency changes this equation entirely. By combining the analytical power of artificial intelligence with the irreplaceable judgment of experienced recruiters, it delivers something neither can achieve alone: speed with precision.",
      "Bridging the Startup Hiring Gap: The challenge isn't a shortage of candidates — it's a shortage of the right ones. AI models trained on successful hire data can identify the specific signals that predict performance: not just skills, but learning velocity, adaptability, and values alignment. This narrows the field dramatically before a human recruiter ever picks up the phone.",
      "Validating Potential with a Skill-Based Hiring Platform: For startups, cultural fit and growth potential matter as much as current skills. A skill-based platform that includes behavioral assessments alongside technical screening surfaces candidates who will grow with the company — not just those who can do the job today.",
      "Executive Search for the Agile Era: Even at the leadership level, AI provides an edge. Senior candidate pools are smaller and more relationship-dependent, but AI can map networks, identify hidden candidates, and prioritize outreach — giving human relationship-builders a better starting point.",
      "The Bottom Line: Faster, Smarter, Better. Startups that partner with Human-Centric AI agencies consistently report not just faster hires, but better ones — measured in performance, retention, and cultural impact. The invisible burn of poor hiring becomes a competitive advantage.",
    ],
  },
  "right-path": {
    title: "How to Choose the Right Path: Recruitment Agency vs. Specialized Agency",
    titleBefore: "HOW TO CHOOSE",
    titleRed: "THE RIGHT PATH",
    excerpt: "Recruitment Agency vs Specialized Agency — Your Business Hiring Decision.",
    heroImage: "/insights-thumbnails/How to choose the right path.png",
    category: "HIRING STRATEGY",
    type: "article",
    readTime: "5 min read",
    content: [
      "Not all recruitment help is created equal. The choice between a generalist recruitment agency and a specialized one is one of the most consequential hiring decisions a growing company can make — and most make it by default rather than by design.",
      "Generalist agencies offer breadth. They can fill roles across functions, move quickly on volume hiring, and leverage large candidate databases. For companies hiring broadly across many functions, this breadth has value. The tradeoff is depth: generalists rarely understand the nuanced technical requirements of a niche role, and their candidate pipelines for specialized positions are shallow.",
      "Specialized agencies offer depth. They know the talent market cold — who's available, what they're worth, what will make them move. For critical senior hires or technical roles where the wrong person is expensive, the precision of a specialist is worth the premium.",
      "The right path depends on what you're building. Early-stage startups hiring generalists across the business benefit from a broad partner. Series B+ companies building out a technical leadership team need a specialist. The mistake is using one when you need the other.",
      "At Merito, we operate as a specialized generalist — deep expertise in tech and growth company hiring, combined with AI-powered breadth. It's the combination that solves both problems at once.",
    ],
  },
  "choose-right": {
    title: "How to Choose Right: Making Decisions That Move Your Business Forward",
    titleBefore: "HOW TO CHOOSE",
    titleRed: "RIGHT",
    excerpt: "Making decisions that move your business forward.",
    heroImage: "/insights-thumbnails/How to choose right.png",
    category: "HIRING STRATEGY",
    type: "article",
    readTime: "4 min read",
    content: [
      "The most expensive hiring decisions aren't the ones that go obviously wrong — they're the ones that seem fine for months before the cracks appear. A candidate who interviews brilliantly but can't deliver independently. A leader who manages up effectively but burns out their team. A senior hire who's perfect for the company you are today, but not the company you need to become.",
      "Choosing right means building a hiring process that surfaces these risks before the offer, not after the 90-day review.",
      "Three practices separate companies that consistently choose right from those that don't. First, they write the job brief as a performance brief — not a list of requirements, but a description of what success looks like in the first 90, 180, and 365 days. Second, they evaluate candidates against that brief, not against their gut feeling in the room. Third, they do structured reference checks that ask specific behavioral questions, not 'would you recommend this person?'",
      "The common thread is structure. Not rigidity — structure. A repeatable, evidence-based process that reduces the variance in outcomes. Companies that hire well don't have better instincts than those that don't. They have better systems.",
    ],
  },
  "ditch-internal": {
    title: "Ditch Internal — Why Fast-Growing Companies Should Specialise Their Hiring",
    titleBefore: "DITCH INTERNAL",
    titleRed: "SPECIALISE",
    excerpt: "Why fast-growing companies should specialise their hiring.",
    heroImage: "/insights-thumbnails/Dutch Internal specialise.jpg",
    category: "HIRING STRATEGY",
    type: "article",
    readTime: "5 min read",
    content: [
      "If you're growing at speed, there's a point at which running recruitment internally stops being a cost-saving measure and starts being a growth constraint. The inflection point is earlier than most companies think.",
      "Internal recruitment teams are optimized for process — posting, screening, scheduling, administering. They're rarely optimized for sourcing excellence: the ability to reach passive candidates who aren't applying, engage them with precision, and close them in a competitive market.",
      "Specialization in hiring means choosing external partners who do one thing — find exceptional people in your specific domain — better than any internal generalist team can. It means buying the expertise, the network, and the technology that takes years to build internally.",
      "The math is simple. A mis-hire at ₹30L annual salary costs the company 2-3x that figure in lost productivity, re-hiring, and team disruption. The cost of a specialist recruitment partner is a fraction of that risk. The companies scaling fastest know this — they invest in specialist recruitment the same way they invest in specialist legal or financial advice. Not because they can't do it themselves. Because doing it better is worth more than doing it cheap.",
    ],
  },
  "retain-top-1": {
    title: "Retain the Top 1%: Executive Search for the Era of Intelligence",
    titleBefore: "RETAIN THE TOP",
    titleRed: "1%",
    excerpt: "Executive Search for the Era of Intelligence.",
    heroImage: "/insights-thumbnails/Retain the top 1%.png",
    category: "EXECUTIVE SEARCH",
    type: "article",
    readTime: "6 min read",
    content: [
      "Finding the top 1% is hard. Retaining them is harder. Executive search is often treated as a placement transaction — the agency delivers a hire, collects a fee, and the relationship ends. The best executive search partnerships work differently.",
      "The top 1% of professionals — the ones who will genuinely transform your leadership team — are not responding to job boards. They're employed, performing, and getting calls from headhunters weekly. What makes them move is not a better salary (though compensation matters) — it's a more compelling opportunity, delivered by someone they trust.",
      "This is why the quality of the search firm's network is the most important variable in executive search, ahead of databases or AI sourcing capability. The relationships that enable a firm to have an honest conversation with a passive candidate about why they should consider leaving a role they're excelling in — those relationships take years to build and can't be purchased.",
      "At the same time, data is increasingly critical even at the executive level. AI can map the talent landscape, identify who's in the right stage of their career for a move, and prioritize outreach. The combination of relationship-first search with AI-powered intelligence is what makes Merito's executive practice distinctive.",
      "Retaining the top 1% starts at the point of hire — with a process rigorous enough to identify them accurately, and an onboarding and compensation structure compelling enough to make them stay.",
    ],
  },
  "ai-in-hiring": {
    title: "How AI Is Redefining the Way Companies Find Talent",
    category: "AI & Hiring",
    type: "article",
    readTime: "6 min read",
    content: [
      "The recruitment industry is undergoing a seismic shift. Artificial intelligence — once a buzzword — is now a core operational tool for the world's most competitive talent teams. From automated sourcing to predictive performance modeling, AI is changing what's possible in hiring.",
      "At Merito, we've been building AI into our hiring process since 2023. Our experience has shown that the biggest gains don't come from replacing human judgment — they come from augmenting it. AI handles the volume; humans handle the nuance.",
      "Here's what we've seen AI do best in the hiring context:",
      "Profile matching at scale: Traditional sourcing means a recruiter manually reviewing hundreds of CVs. AI models trained on historical hire data can surface the top 10% of profiles in minutes — not days. Our own sourcing AI reduced first-pass screening time by 70%.",
      "Bias reduction: Structured AI scoring based on explicit criteria reduces the unconscious bias that plagues unstructured interviews. When every candidate is evaluated on the same dimensions, the best talent rises — regardless of where they went to school.",
      "Predictive performance scoring: Using data from past hires, AI can identify which profile characteristics correlate with on-the-job success in specific roles. This turns hiring from guesswork into a repeatable, evidence-based process.",
      "The companies winning the talent war aren't those with the biggest teams — they're the ones using AI to hire smarter. The future of recruitment is already here. The question is: is your company ready?",
    ],
  },
  "top-2-percent": {
    title: "Why the Top 2% Candidates Never Apply to Your Job Post",
    category: "Talent Strategy",
    type: "article",
    readTime: "5 min read",
    content: [
      "Here's a hard truth about job posts: the best candidates in any field are almost never actively looking. They're employed, performing well, and getting calls from people who already know their reputation.",
      "Your job post on LinkedIn reaches the active market — roughly 20-30% of the total talent pool. The top 2% you're actually looking for? They're in the passive market. They're not applying. They're being approached.",
      "This is the fundamental flaw in most companies' recruitment strategy: they're fishing in the same overcrowded pond as everyone else, wondering why they're not catching the fish they want.",
      "Reaching passive talent requires a different playbook. It means building relationships before you have a role to fill. It means having a compelling employer brand that makes people want to work for you before they even hear about the job. And it means having recruiters with deep enough networks to find people who aren't raising their hands.",
      "At Merito, our AI sourcing engine is specifically designed to identify and engage passive candidates — the ones who don't have 'open to work' turned on. We cross-reference professional activity, career trajectory, skill signals, and network data to find people who would be exceptional in a role, then reach out with a personalized pitch.",
      "The result: our candidate shortlists consistently outperform those built from active applications on every performance metric that matters.",
    ],
  },
  "offer-acceptance-rate": {
    title: "5 Reasons Your Offer Acceptance Rate Is Below 70%",
    category: "Hiring Process",
    type: "article",
    readTime: "5 min read",
    content: [
      "If more than 3 in 10 candidates you extend offers to are declining them, you have a pipeline problem — not a compensation problem. Most hiring teams jump straight to salary benchmarks when offer acceptance drops. That rarely fixes it.",
      "Reason 1: You took too long. The best candidates have options. A 3-week gap between final interview and offer letter is enough time for a competing company to close them. Speed of offer is one of the highest-leverage levers in your hiring process.",
      "Reason 2: The offer came as a surprise. Candidates who are not pre-closed before the offer lands are candidates who might say no. The offer conversation should confirm a decision already made — not be the first time a candidate hears the number.",
      "Reason 3: Your employer brand is working against you. If candidates Googled your company and found Glassdoor reviews talking about poor management or slow growth, your offer is fighting that narrative. What people say about working for you matters more than what you say.",
      "Reason 4: The process itself damaged the relationship. Long, impersonal hiring processes leave candidates feeling processed, not valued. By the time the offer comes, enthusiasm has eroded. The experience of being hired is part of the offer.",
      "Reason 5: You're not solving the candidate's actual problem. Every candidate has a primary driver — growth, compensation, stability, flexibility, mission. If your offer doesn't clearly address that driver, it gets declined for the offer that does. Know what matters to each candidate before you make the offer.",
    ],
  },
  "structured-interviews": {
    title: "Structured vs Unstructured Interviews: What the Data Says",
    category: "Interviewing",
    type: "article",
    readTime: "7 min read",
    content: [
      "Decades of industrial-organizational psychology research reach the same conclusion: structured interviews predict job performance significantly better than unstructured ones. Yet the majority of interviews conducted today are still effectively unstructured — driven by instinct, rapport, and whatever questions the interviewer happens to think of.",
      "What makes an interview structured? Three things: predetermined questions asked in the same order to every candidate, a standardized scoring rubric applied consistently, and multiple interviewers whose scores are aggregated rather than dominated by a single voice.",
      "The research is clear. Unstructured interviews have a validity coefficient of about 0.20 — meaning they explain roughly 4% of variance in job performance. Structured interviews have a validity coefficient of around 0.51, explaining 26% of variance. That's a 6x improvement in predictive power.",
      "Why do unstructured interviews persist despite the evidence? Three reasons. First, they feel more natural — both to interviewers and candidates. Second, they require more upfront work to design. Third, interviewers overestimate their own ability to read people.",
      "At Merito, our ICE assessment framework is built on structured interview principles — consistent questions, behavioral anchors for scoring, and multi-rater calibration. The result is hiring decisions backed by evidence rather than impression. Our data shows structured ICE-assessed candidates perform 40% better in 90-day reviews than those hired through traditional unstructured processes.",
    ],
  },
  "reference-checks-matter": {
    title: "Reference Checks Are Broken. Here's How to Fix Them",
    category: "Reference Checks",
    type: "article",
    readTime: "5 min read",
    content: [
      "The traditional reference check is a relic. A recruiter calls two or three numbers provided by the candidate — people the candidate chose specifically because they'll say good things — asks vague questions, gets vague positive answers, and files the call as 'check complete.' Nothing meaningful is learned.",
      "This explains why reference checks have a reputation for adding no value. They don't — when done the traditional way. But that's a process failure, not an inherent limitation of reference checking as a concept.",
      "Done correctly, reference checks are one of the highest-signal data sources in the entire hiring process. They give you access to people who have actually seen this candidate perform under pressure, handle conflict, and grow (or not grow) over time.",
      "The fix has three parts. First, ask structured, behaviorally-anchored questions — not 'would you rehire?' but 'can you describe a specific situation where this person handled a setback at work?' Second, get quantitative scores on key competencies so you can compare candidates objectively. Third, call beyond the provided references — go to LinkedIn, find mutual connections, do back-channel reference work.",
      "Merito's Ref-Track platform automates and structures the entire reference check process — automated outreach, structured questionnaires, quantitative scoring, and dashboard tracking. The result: reference checks that take hours instead of days and actually tell you something.",
    ],
  },
  "employer-branding": {
    title: "Your Employer Brand Is Your Best Recruiting Tool — Are You Using It?",
    category: "Employer Brand",
    type: "article",
    readTime: "6 min read",
    content: [
      "Before a candidate ever reads your job description, they've already formed an opinion about working for you. They've seen your LinkedIn company page, read your Glassdoor reviews, noticed whether your current employees talk positively about the company online. Your employer brand is always working — the question is whether it's working for you or against you.",
      "The data is striking: companies with strong employer brands receive 50% more qualified applications, pay 43% less per hire, and see 28% lower turnover. Employer brand isn't a marketing exercise — it's a core business driver with direct impact on hiring costs and team quality.",
      "The three components of a strong employer brand: authentic culture visibility (what does it actually feel like to work here, shown through real stories and real people), clear value proposition (why should a talented person choose you over your competitor), and consistent candidate experience (every touchpoint from job post to offer shapes perception).",
      "Most companies treat employer branding as a one-time project — a careers page redesign, a batch of employee testimonial videos. The companies that win in talent acquisition treat it as an ongoing practice: continuously collecting and sharing authentic stories, responding to reviews, measuring Net Promoter Score with candidates, and closing the feedback loop.",
      "Your next great hire is watching how you treat every candidate — including the ones you don't hire. What are they seeing?",
    ],
  },
  "time-to-hire": {
    title: "The Real Cost of a 90-Day Time-to-Hire (And How to Cut It in Half)",
    category: "Efficiency",
    type: "article",
    readTime: "6 min read",
    content: [
      "Most hiring teams track time-to-hire as an operational metric. Few calculate what it actually costs. The math is brutal: if a senior role generates ₹50L of value per year, every month it sits open costs the business ₹4.2L in lost productivity — before you count the distraction cost on the team covering for the gap, the recruiter hours spent on a months-long search, and the cost of a rushed bad hire at the end.",
      "The industry average time-to-hire for senior roles is 68 days. For technical roles, it's often 90+. Merito's average: 11 days from brief to shortlist, 21 days to offer.",
      "What drives the difference? Three things. First, sourcing speed: AI-powered sourcing means a qualified longlist in 48 hours, not 3 weeks. Second, pipeline discipline: every candidate at every stage has a defined SLA. No candidate sits in limbo for 10 days waiting for interview scheduling. Third, pre-closing: candidates are nurtured and pre-closed throughout the process, so offer-to-accept time is days, not weeks of negotiation.",
      "The 90-day time-to-hire is not an industry inevitability. It's a process problem. Companies that treat hiring as a high-priority, well-resourced function with clear metrics and accountability consistently hire faster — and better — than those that don't.",
      "The 48-hour sourcing speed that Merito offers isn't a gimmick. It's what happens when you apply the same operational rigor to recruitment that high-performing teams apply to every other function.",
    ],
  },
  "diversity-hiring": {
    title: "Building Diverse Teams Without Sacrificing Standards",
    category: "Diversity & Inclusion",
    type: "article",
    readTime: "5 min read",
    content: [
      "The framing of 'diversity vs. standards' is a false choice — and it's one that prevents companies from building the teams they actually need. The implicit assumption is that the default candidate pool (often skewed toward certain demographics, universities, and networks) represents the standard, and that diversity is a compromise of it. That assumption is wrong.",
      "Research consistently shows that diverse teams outperform homogeneous ones on complex problem-solving, creativity, and innovation. The business case for diversity isn't about fairness (though it is fair) — it's about building the team most likely to win.",
      "The reason diversity initiatives fail is almost never because diverse candidates don't exist. It's because the sourcing, screening, and interview processes systematically filter them out — through network-based sourcing that replicates existing demographics, unstructured interviews that advantage confident self-presenters, and unconscious bias in evaluation.",
      "The fix is process-level, not cosmetic. Structured sourcing that actively reaches underrepresented networks. Blind screening on first-pass review. Structured interviews with standardized scoring rubrics that reduce interviewer discretion. Diverse interview panels. These changes don't lower the bar — they change who can clear it.",
      "At Merito, our AI sourcing actively surfaces candidates from a broad range of backgrounds, and our ICE assessment evaluates capability directly — not proxy signals like which company someone worked at before. The result is shortlists that are both high-quality and diverse.",
    ],
  },
  "candidate-experience": {
    title: "Why Candidate Experience Is Your Next Competitive Advantage",
    category: "Candidate Experience",
    type: "article",
    readTime: "5 min read",
    content: [
      "72% of candidates share negative hiring experiences online. In an era where your next great hire is likely researching you before they apply, every bad experience is a recruiting liability — and every exceptional one is an asset.",
      "Candidate experience is the sum of every interaction a person has with your company during the hiring process: the job description they read, the application form they fill out, the communication (or lack thereof) they receive, the interviews they sit through, the feedback they get (or don't), and the offer process at the end.",
      "Most companies invest heavily in the front end — employer brand, job posts, sourcing. And then drop the ball on the experience itself. Applications that disappear into silence. Interview processes that stretch to 6 rounds without explanation. Offer letters that arrive weeks after the final interview. Feedback that never comes.",
      "The companies with the best candidate experience do three things consistently: they communicate proactively at every stage, they give every candidate a clear decision timeline and stick to it, and they treat candidates who don't get the role with the same respect as those who do.",
      "The ROI is real. Companies with top-quartile candidate experience see 70% higher offer acceptance rates and significantly higher quality of applicant — because strong candidates have the most options and choose the companies that treat them best.",
    ],
  },
  "recruiter-vs-hiring-manager": {
    title: "The Recruiter-Hiring Manager Alignment Problem (And How to Solve It)",
    category: "Talent Strategy",
    type: "article",
    readTime: "6 min read",
    content: [
      "The single most common cause of slow, expensive, and ultimately failed hires is misalignment between the recruiter and the hiring manager. It's not a talent market problem. It's not a compensation problem. It's a communication problem — and it's entirely preventable.",
      "Misalignment shows up in predictable ways: a recruiter sends 10 candidates and the hiring manager rejects 9 of them without clear explanation. Or a hiring manager keeps moving the goalposts after the search has started. Or both parties think the search is going well until a 3-month process ends with no hire.",
      "The solution is a rigorous intake process — not a 15-minute call, but a structured 60-90 minute session that nails down: the business problem this role solves, the specific outcomes the hire will be measured on in their first 90 days, the non-negotiable skills vs. the nice-to-haves, the profile of the best person currently in a similar role (and why they're great), and the realistic candidate profile given the compensation band.",
      "At Merito, we run a Strategic Setting session at the start of every search. The output is a written brief that both the recruiter and hiring manager sign off on. When a candidate is reviewed, evaluation is against the brief — not against a vague and shifting mental model.",
      "Alignment at the start is what makes speed possible throughout. A well-aligned search moves 3x faster than a misaligned one.",
    ],
  },
  "ice-assessment": {
    title: "What Is ICE? Merito's In-Depth Capability Assessment Explained",
    category: "Assessment",
    type: "article",
    readTime: "7 min read",
    content: [
      "ICE stands for In-depth Capability Evaluation — Merito's proprietary framework for assessing candidates beyond what a resume or standard interview can reveal. It's the backbone of how we consistently identify candidates who don't just look good on paper but actually perform.",
      "The premise behind ICE: traditional hiring evaluates inputs (education, past employers, years of experience) as proxies for the output we actually care about (on-the-job performance). ICE evaluates the output directly — by measuring the specific capabilities that predict success in the role.",
      "ICE has three components. First, a structured capability test — role-specific assessments that measure functional knowledge and applied reasoning, not general IQ. Second, a behavioral interview — a standardized set of situation-based questions that surface real past behavior as evidence of future behavior (the best predictor of performance). Third, a culture-fit calibration — structured assessment of working style, values alignment, and team dynamics fit.",
      "Each component produces a scored output, and scores are weighted according to the role profile. A technical role weights the capability test more heavily; a leadership role weights behavioral interview higher. The composite ICE score is what goes to the hiring manager — along with specific evidence for each dimension.",
      "The data from our placements shows a consistent pattern: candidates with high ICE scores outperform those hired through traditional processes by 35% on 6-month performance reviews. ICE doesn't guarantee a great hire — but it makes one significantly more likely.",
    ],
  },
  "startup-hiring": {
    title: "Hiring for Startups: Why Speed and Culture Fit Aren't Opposites",
    category: "Startups",
    type: "article",
    readTime: "5 min read",
    content: [
      "Early-stage startups face a hiring paradox: they need to hire faster than anyone else (growth waits for no one), but they also need to be more selective than anyone else (a bad hire at 15 people is an existential risk in a way it's not at 1,500).",
      "Many startups resolve this paradox by prioritizing one over the other. Hire fast and fix culture problems later. Or be incredibly selective and slow down growth. Both approaches have costs. The better resolution is to build a hiring process that's simultaneously fast and rigorous.",
      "The key is preparation. Startups that hire well at speed have done the work upfront: they know exactly what they need (written role brief), they have a structured 3-step interview process that can run in a week, they have compensation frameworks ready so offers go out within 24 hours of final interview, and they've built enough employer brand that strong candidates already want to talk to them.",
      "Culture fit at early-stage isn't about finding people who are exactly like the founders. It's about finding people who share the values that matter for how the company operates — speed, ownership, transparency, resilience — and can adapt to the chaos inherent in the early days.",
      "Merito has placed talent in 50+ growth companies. The fastest, most successful hires share a pattern: tight brief, fast process, aggressive pre-closing, and an offer that lands before the candidate has time to second-guess.",
    ],
  },
  "future-of-recruitment": {
    title: "The Future of Recruitment Is Already Here — Is Your Company Ready?",
    category: "Future of Work",
    type: "article",
    readTime: "6 min read",
    content: [
      "The recruitment industry is being reshaped faster than most hiring teams realize. The trends driving change — AI-powered sourcing and screening, changing candidate expectations around experience and transparency, the rise of skills-based hiring over credential-based hiring, and the acceleration of remote and hybrid work — are not future projections. They're current reality.",
      "AI is the most visible transformation. Companies that have integrated AI into sourcing can evaluate thousands of profiles in the time it previously took to review dozens. The bottleneck has moved from 'can we find the candidates' to 'can we evaluate them accurately and quickly.' That's a fundamentally different problem — and a better one.",
      "Candidate expectations have shifted irreversibly. Top candidates — especially in tech and specialized functions — expect fast communication, transparent processes, and personalized engagement. The companies that still run 6-round, 8-week interview processes with weeks of radio silence between stages are losing the best candidates to companies that offer a better experience.",
      "Skills-based hiring is gaining momentum. Forward-thinking companies are already deprioritizing degree requirements and traditional career paths in favor of demonstrated capability. This expands the talent pool dramatically — and requires better assessment frameworks to evaluate candidates who don't have conventional credentials.",
      "Merito was built for exactly this moment. Our AI sourcing, ICE assessment framework, and tools like Offer Vault and Ref-Track are designed for the recruitment landscape that exists now — not the one that existed 10 years ago. The companies adapting to this new reality will build better teams, faster. The ones that don't will keep wondering why hiring is so hard.",
    ],
  },
  "acquired-intelligence-talent": {
    title: "Acquired Intelligence for Talent Problems",
    titleBefore: "Acquired Intelligence for",
    titleRed: "Talent Problems",
    date: "April 23",
    heroImage: "/insights-thumbnails/insight-Hero Banner.png",
    category: "Podcast",
    type: "podcast",
    episode: "Ep. 01",
    duration: "05:05",
    content: [
      "In the business sphere, artificial intelligence (AI) has gained popularity as many businesses look to it for problem-solving strategies. AI solutions are being sought after as a magic wand by HR and talent managers to fix their people issues.",
      "Companies should explore acquired intelligence to address these issues before implementing AI. Our distinctive method of learning from a variety of sources, such as employee evaluations, feedback, data analytics, and human intuition, is known as acquired intelligence. With the use of this gathered intelligence, businesses may spot trends, patterns, and correlations that would otherwise be difficult to spot and create focused plans to enhance hiring, retention, engagement, and performance.",
      "Companies can leverage acquired information in a variety of ways to tackle their workforce difficulties. Firstly, Businesses can use acquired intelligence to determine which traits and competencies are most crucial for success in various professions while hiring. Companies can gain a better understanding of the characteristics most predictive of success in various professions by analyzing data from personnel assessments and interview responses. By doing this, businesses may be able to hire more effectively.",
      "Secondly, The so-called Great Resignation is having a significant impact on enterprises, from microbusinesses to large organizations. Small traders and laborers were primarily impacted by COVID-19's atrocities. In April 2020, a record 91 million Indians lost their jobs, according to Statista. Both salaried employees and business owners lost their employment in India, totaling about 119 million people. Mid-career workers are driving the flight, which is leaving a huge void in many different job categories. This has resulted in a highly competitive jobs market in which many companies are struggling to retain employees and attract new talent.",
      "Companies can prevent attrition levels from rising by collecting data about their work experience in the environment, prioritizing work-life balance, and appreciating their contribution is essential. Any problem identified can be solved through analysis and implementation thus retaining employees.",
      "Thirdly, the organization's talent gaps can be found using acquired intelligence. Companies can determine areas where employees might require further training or growth opportunities by analyzing data from employee assessments and performance reviews. This can aid to guarantee that workers have the abilities necessary to carry out their tasks well and to promote their career advancement within the company.",
      "Fourthly, when an employee is hired, the skill gap study can begin. Usually, businesses don't make use of interview-related data points. By assessing these inputs and interview feedback, companies can use this significant data point to map present abilities, the gaps, and the plans to close such gaps with the help of training programs thus ensuring skill development.",
      "Fifthly, it is also possible to use acquired intelligence to spot bias or discrimination within an organization. Companies can spot potential inequities in hiring, promotion, or salary by examining data from performance reviews, feedback, and other sources. This can assist businesses in creating focused plans to encourage diversity and inclusion inside the workplace.",
      "Lastly, acquired intelligence can be used to improve performance management within the organization. Companies can spot areas where workers might be having trouble or where they might need more support by analyzing data from performance reviews, feedback, and other sources. This can assist managers in giving staff-focused criticism and coaching to help them perform better.",
      "In conclusion, while AI can be useful in solving people's issues, businesses should also take into account utilizing gained intelligence to develop a more thorough understanding of their staff members and their needs. Companies can create focused plans to enhance hiring, retention, engagement, and performance inside their organization by analyzing data from a variety of sources and relying on human intuition.",
    ],
  },
  "recruitment-as-sales": {
    title: "Think of Recruitment as Sales",
    titleBefore: "Think of Recruitment",
    titleRed: "as Sales",
    date: "Feb 7",
    heroImage: "/insights-thumbnails/insight-Hero Banner.png",
    category: "Podcast",
    type: "podcast",
    episode: "Ep. 02",
    duration: "05:03",
    content: [
      "Salespeople and recruiters both have several complementary skill sets. The core functionality of selling a product or an opportunity is what aligns Sales with Recruitment. Just like a salesperson, recruiters need to possess a broad range of interpersonal abilities. Additionally, recruiters need to be adept at time management and project management.",
      "One of the major important aspects of recruitment is employer brand management. Identified in line with Marketing, a company needs to ensure that candidates walk away from interactions with recruiters thinking positively about the employer brand. Recruitment is no exception to the rule that marketing is the foundation of all sales activities. Employer branding and employer value proposition are highlighted by this. This enables the business to consciously develop and promote its employer brand.",
      "Bring technology – The correct methods and technology will aid recruiters in data collection, performance evaluation, and wise decision-making. Scaling TA is made more efficient as a result. The ATS (Applicant Tracking System), which is necessary to organize recruiting and obtain useful data on the recruitment process, is the bare minimum technology required.",
      "The characteristics and conduct of a recruiter towards prospects will change if they create customer delights by treating job applicants as their potential customers. At every stage, deliberate steps will be made to guarantee candidate delight. Candidates who are more satisfied with the interview process are more likely to recommend you to others, which helps you strengthen your brand.",
      "Find the Right Recruitment Partners – Recruitment partners are essential to addressing recruiting needs. The perfect recruitment partner should complement your current recruitment team and share your philosophy and methodology for hiring. According to the categories you established throughout the hiring process, the company can divide its recruitment partners into different groups and only work with partners on those parts where hiring is urgently needed and is crucial to the operation of the business.",
      "The factor of Empathy – Recruiters want to become experts in their fields, learn about the market, and address issues related to human resources. The only way for recruiters to establish long-lasting connections with their customers and applicants is by introducing the most qualified prospects for open positions and making placements.",
      "The product that recruiters market is distinct and emotive. A product that allows users to alter their life. No doubt, things go off track sometimes. There's no use in trying to fit square pegs into round holes. A recruiter can boost their success if they follow the appropriate procedures, but some factors will always be beyond their control.",
      "Elite recruiters are rewarded with repeat business and the client's perception of them as trustworthy advisers since they have solid career histories and have established themselves as authorities in their fields. To conclude, if you are looking to scale your recruitment just draw inspiration from your sales and marketing.",
    ],
  },
  "ice-in-hiring": {
    title: "Do you have ICE in your Hiring?",
    titleBefore: "Do you have ICE in your",
    titleRed: "Hiring",
    date: "Dec 22",
    heroImage: "/insights-thumbnails/insight-Hero Banner.png",
    category: "Podcast",
    type: "podcast",
    episode: "Ep. 03",
    duration: "03:24",
    content: [
      "The article focuses on the most important component of hiring in an organization – ICE. You might be initially confused by the name ICE because it suggests poaching more Gen Y talent than.",
      "The In-depth Capability Evaluation, or ICE, is a hiring paradigm that most businesses overlook. Businesses frequently begin the hiring process with a job description that is either too complicated or too general to understand. The hiring manager will then conduct a series of interviews with candidates to see whether they are a good match for the position. The knowledge of the skills a company is trying to hire and how to include them in the evaluation framework that helps you rapidly determine a candidate's job fit is what is lacking in this situation.",
      "Nearly 80% of businesses neglect to consider the qualities they seek in candidates and how to evaluate them. As a result, the candidate and the employer go through a series of pointless interviews that have no effect.",
      "Companies must make sure skill maps and assessment frameworks are developed for each job function they are hiring for to optimize their recruitment process.",
      "However, merely having an assessment framework is insufficient. Every phase of the interview process must be designed to evaluate a candidate's competencies, according to the company.",
      "In the same way that too much ICE may ruin a drink, too much evaluation can lead to numerous rounds of pointless interviews and a bad candidate experience. After creating a competence framework, you should do an online and offline evaluation before the interview. It shortens the hiring process and aids the candidate in determining their suitability for the position.",
      "For each position that Merito is employing for a customer, a capability map is established and an assessment methodology is decided upon before hiring. To speed up the assessment process, several online tests and video interviews are used. Therefore, companies must ensure to include ICE in their hiring process before beginning to fill any post.",
    ],
  },
  "improve-hiring-experience": {
    title: "What companies can do to Improve Hiring Experience",
    titleBefore: "What companies can do to Improve",
    titleRed: "Hiring Experience",
    date: "Feb 7",
    heroImage: "/insights-thumbnails/insight-Hero Banner.png",
    category: "Podcast",
    type: "podcast",
    episode: "Ep. 04",
    duration: "09:22",
    content: [
      "\"How candidates feel about your company after they experience your hiring process\" is the candidate experience. And whether positive or negative, these candidate \"feelings\" affect candidates' decisions to apply to your business or accept your job offer.",
      "A study suggests, 27% of unsuccessful candidates said they deliberately discouraged other applicants from applying. Additionally, 77 percent of candidates are likely to recommend them to people in their network after having a favorable experience.",
      "Because there are more options available to candidates today, it is more difficult for businesses to stand out from the competition and demonstrate how their values, corporate culture, and workforce offer a distinctive opportunity for top prospects. By providing a good candidate experience, businesses can win over candidates' trust and loyalty, which could lead to advocates for the business and stronger employer branding. Organizations may stand out as an employer of choice in their industry with a stronger employer brand.",
      "It is also important to know that recruiters cannot be solely blamed for the negative customer experience but rather for the process or system. Companies can take various measures to address this issue. Some of them are listed below:",
      "Lack of Clarity in Job Descriptions – Job descriptions that are poorly written don't draw in the proper candidates. Most job descriptions are either complicated or too general. Additionally, it gives applicants the impression that they fulfill all requirements but are not shortlisted.",
      "Instead, organizations should write job descriptions that highlight what a candidate would be expected to achieve during their first month, three months, six months, and a year into the job. The improved clarity will provide candidates with a clear understanding of what they can expect if they are hired.",
      "Follow up Often – As soon as you can, send an email of rejection or an invitation to an interview. One of the best methods to enhance candidate experience is by swiftly responding to applicants, whether you have good or negative news. This will set you apart and show that you appreciate your prospects' time.",
      "Close the loop of candidates – Don't forget to let the other candidates know the outcome after selecting a candidate. If candidates don't get a response in any way, the company's reputation may suffer. Continual communication can maintain candidate interest. However, it is equally vital to notify applicants who will not advance to the next stage of the interview process.",
      "Using the right technology – AI-powered automated recruitment marketing will assist in identifying the most effective methods for connecting with top candidates, including social media platforms like LinkedIn. Additionally, video interviews conducted using services like Teams, Zoom, or Skype might speed up the recruitment process. According to the typical recruiter fills positions in 30 days. Online tests are two major causes for this response rate. Firstly, there are far more applications for recruiters than there are for founders. Secondly, the candidate's experience is not a factor in how well a recruiter performs.",
      "Evaluating Performance of Recruiters – Most businesses use the output, which is often the number of prospects a recruiter converts, to evaluate recruiters' performance. As a result, they become solely concerned with the results, and the candidate's experience is ignored. Despite their busy schedules, founders are seen to respond to applicants at a rate that is noticeably higher than that of recruiters. There are two major causes for this response rate. Firstly, there are far more applications for recruiters than there are for founders. Secondly, the candidate's experience is not a factor in how well a recruiter performs.",
    ],
  },
  "strategy-2026": {
    title: "Why Your 2026 Strategy Needs a Specialist Executive Search Partner",
    titleBefore: "YOUR 2026",
    titleRed: "STRATEGY",
    excerpt: "Why Your 2026 Strategy Needs a Specialist Executive Search Partner.",
    heroImage: "/insights-thumbnails/Your 2026 stratergy.jpg",
    category: "LEADERSHIP HIRING",
    type: "article",
    readTime: "6 min read",
    stats: [
      { value: "40%", label: "FASTER HIRING WITH AI" },
      { value: "78%", label: "OF 2026 GROWTH PLANS" },
      { value: "TALENT GAPS", label: "BLOCK PROGRESS" },
    ],
    content: [
      "As we move toward 2026, the narrative around recruitment is dominated by one thing: automation. AI is no longer a futuristic concept; it is a baseline tool for support functions across every enterprise. But as the market becomes saturated with AI-driven sourcing bots and automated outreach, a critical question arises for founders and boards: If every company has access to the same AI tools, what constitutes a competitive advantage in hiring?",
      "The answer lies in 'Acquired Intelligence.' While an AI recruitment agency can provide the speed to find a needle in a haystack, it is the specialist executive search partner who knows what to do with that needle once it's found.",
      "Many internal HR teams are currently experimenting with AI tools to reduce their reliance on an external recruitment agency. However, these tools are not a 'set-and-forget' solution. Without the domain expertise to interpret AI data, internal teams often face a steep learning curve that impacts execution velocity. In contrast, a specialized executive search firm has already mastered these tools across dozens of clients and hundreds of mandates. We bring Acquired Intelligence — the lived experience of having handled similar senior roles before — to ensure the technology is an enabler of quality, not a source of delay.",
      "The higher you go in an organization, the more the hiring process becomes a two-way psychological negotiation. A senior leader doesn't just 'apply' for a job; they make a choice with conviction. This is a role that AI simply cannot fulfil. An executive search partner like Merito acts as a strategic bridge. We spend years building relationships with the top 2% of talent, understanding their motivations long before they hit the market.",
      "In 2026, 'gut-feel' is no longer a viable strategy for senior hires. Every leadership placement must be de-risked. We replace hypothetical interview questions with high-stakes simulations that evaluate a leader's ability to architect AI-driven teams and navigate market volatility. By combining this technical validation with our proprietary Ref-Track tool, we provide quantified data on a candidate's past work experience — ensuring your executive search results in a leader with 90% fit accuracy and an 85% chance of staying beyond the two-year mark.",
      "AI is proliferating at an incredible rate, but the core of leadership hiring remains unchanged: it is a business of trust, reputation, and human insight. Merito offers the perfect hybrid — the technological edge of an AI recruitment agency and the specialized Acquired Intelligence of a premier executive search house.",
    ],
  },
  "hire-from-within": {
    title: "Why the Best Way to Hire Top Talent is to Start With Your Current Team's Culture",
    titleBefore: "HIRE FROM",
    titleRed: "WITHIN",
    excerpt: "Why the best way to hire top talent is to start with your current team's culture.",
    heroImage: "/insights-thumbnails/hire from within.jpg",
    category: "TALENT & CULTURE",
    type: "article",
    readTime: "5 min read",
    stats: [
      { value: "40%", label: "LOWER MIS-HIRE RATE" },
      { value: "89%", label: "OF BAD HIRES" },
      { value: "CULTURE FIT", label: "ROOT CAUSE" },
    ],
    content: [
      "In the early days of a startup, culture isn't a handbook or a set of posters on the wall — it's the founder's psyche. It is the invisible set of values, quirks, and work ethics that exist in the founder's head. But as you scale, that internal compass becomes harder to share. This 'cultural riddle' is the single biggest bottleneck to scaling.",
      "When culture remains an undefined feeling, stakeholders end up with conflicting views. To hire top talent who actually stay, you have to stop looking outward and start looking in the mirror.",
      "Your early-stage employees define the actual culture of your workspace, not your mission statement. The best way to solve the culture gap is to run assessments on your existing team using frameworks like the Big Five (OCEAN). By translating your culture into personality traits, you create a benchmark: for innovation-led teams, you look for high 'Openness to Experience'; for high-autonomy teams, you look for candidates who score lower on 'Agreeableness.' Merito's Skill-based Hiring Platform automates this benchmarking — helping founders take the personality fingerprint of their best employees and use it as a filter.",
      "Traditional hiring relies on gut-feel interviews, which are only about 40% accurate. A modern AI recruitment agency like Merito removes this subjectivity. We combine Artificial Intelligence with the Acquired Intelligence of your existing team's data. Our platform doesn't just look at skills — it evaluates Human-Plus elements. By integrating AI-driven psychometric scorecards into the funnel, we ensure that the candidates reaching the final round aren't just technically capable; they are psychologically aligned with the founder's vision.",
      "When it comes to executive search, cultural misalignment isn't just a nuisance — it's a catastrophe. A VP or C-suite hire who doesn't mesh with the existing team's personality traits can dismantle years of progress in months. This is why Merito uses proprietary tools like Ref-Track during an executive search. We don't just check references; we validate behavioral patterns.",
      "To hire top talent effectively, you must realize that culture is a measurable asset. By assessing your current team, you turn a 'feeling' into a strategy. Stop guessing about cultural fit and start measuring it — because the best way to build your future is to understand who you are today.",
    ],
  },
  "slow-hiring-costs": {
    title: "Is Your Lengthy Recruitment Process Costing You Top Talent?",
    titleBefore: "SLOW HIRING",
    titleRed: "COSTS YOU",
    excerpt: "Is Your Lengthy Recruitment Process Costing You Top Talent?",
    heroImage: "/insights-thumbnails/Slow hiring costs you.jpg",
    category: "HIRING PROCESS",
    type: "article",
    readTime: "5 min read",
    stats: [
      { value: "40%", label: "FASTER HIRING" },
      { value: "10 DAYS", label: "IS THE WINDOW" },
      { value: "BEFORE TOP TALENT", label: "ACCEPTS ELSEWHERE" },
    ],
    content: [
      "In the competitive race to hire top talent, many founders and HR leaders operate under a dangerous myth: that a high number of interview rounds equates to a high quality of hire. A bloated, repetitive, and lengthy process doesn't filter for the best — it filters for the most desperate. The most elite candidates are passive 'top 2%' who aren't actively looking and are often being approached by five other companies simultaneously. The moment your process hits the fifth or sixth round, you aren't just measuring their skills — you are testing their patience.",
      "At Merito, we specialize in collapsing these timelines. By using an AI recruitment agency framework, we help companies reduce their time-to-hire by 60%.",
      "Most lengthy processes are a collection of redundant conversations. A smarter approach, used by elite B-schools and top-tier tech firms, is to consolidate. Instead of five separate rounds, consider a 'Panel of Experts' model where multiple interviewers join a single round, each evaluating a different capability.",
      "One reason processes become lengthy is a lack of confidence. Stakeholders keep adding rounds because they aren't sure if the candidate truly has the skills. This is where a Skill-based Hiring Platform changes the game. Instead of adding more conversation, add more evidence.",
      "For a passive candidate, the interview process is their first window into your company's operational efficiency. A lengthy process signals bureaucracy and indecision. An AI recruitment agency like Merito ensures that engagement remains high through rapid feedback loops, contextual accuracy, and transparent timelines — giving candidates a clear impact roadmap instead of a vague series of chats.",
      "The stakes are even higher during an executive search. A C-suite candidate's time is their most valuable asset. Merito de-risks this by using Ref-Track, our proprietary reputation validation tool. By partnering with Merito, you gain access to an AI recruitment agency that prioritizes velocity and candidate experience. Stop letting your process be the reason you miss out on the best.",
    ],
  },
  "modern-playbook": {
    title: "The Modern Playbook to Hire Top Talent in a High-Churn Market",
    titleBefore: "THE MODERN",
    titleRed: "PLAYBOOK",
    excerpt: "The Modern Playbook to Hire Top Talent in a High-Churn Market.",
    heroImage: "/insights-thumbnails/The modern playbook.jpg",
    category: "TALENT STRATEGY",
    type: "article",
    readTime: "6 min read",
    stats: [
      { value: "85%", label: "TWO-YEAR RETENTION RATE" },
      { value: "3 in 5", label: "TOP PERFORMERS" },
      { value: "OPEN TO LEAVING", label: "WITHIN 12 MONTHS" },
    ],
    content: [
      "In today's volatile job market, the 'Great Resignation' has evolved into the 'Constant Churn.' Average retention periods have plummeted, driven by a Gen Z workforce that values alignment over traditional loyalty. For founders and HR leaders, the challenge has shifted: it's no longer just about filling a seat — it's about finding the 'Stickiness Factor.' By moving away from gut-feel and toward data-driven intelligence, Merito helps companies achieve an 85% two-year retention rate.",
      "The first mistake companies make in a high-churn market is having a vague definition of 'quality.' At Merito, our Skill-based Hiring Platform ensures that quality is defined by deeds, not degrees.",
      "High churn is often a symptom of 'cultural friction.' A modern AI recruitment agency like Merito solves this by translating abstract culture into objective personality attributes. Using frameworks like the Big Five (OCEAN), we create a measurable benchmark for cultural fit that goes beyond gut feeling.",
      "In a high-churn market, the 'Candidate Experience' is your best marketing tool. Merito functions as a high-touch AI recruitment agency, ensuring that even passive candidates are engaged through transparent feedback, AI-powered velocity, and moving from first contact to offer in under 20 days.",
      "In a churning market, losing a senior leader is catastrophic. Merito de-risks leadership hiring by combining Artificial Intelligence with Acquired Intelligence. We use our proprietary Ref-Track tool to automate reputation validation for executive search, ensuring cultural alignment at the top.",
      "Partnering with Merito allows you to leverage a Skill-based Hiring Platform that maps both competency and character. Stop fighting the churn and start outsmarting it.",
    ],
  },
  "rest-to-reality": {
    title: "How a Skill-Based Hiring Platform Turns Assessments into Real-World Simulations",
    titleBefore: "FROM TEST TO",
    titleRed: "REALITY",
    excerpt: "How a Skill-Based Hiring Platform Turns Assessments into Real-World Simulations.",
    heroImage: "/insights-thumbnails/From rest to reality.jpg",
    category: "AI RECRUITMENT",
    type: "article",
    readTime: "5 min read",
    stats: [
      { value: "4x", label: "MORE PREDICTIVE ACCURACY" },
      { value: "92%", label: "HIRE CONFIDENCE" },
      { value: "ICE FRAMEWORK", label: "INCLUDED" },
    ],
    content: [
      "In the traditional hiring landscape, the gap between 'passing an interview' and 'performing on the job' has always been a costly risk for startups. For years, the standard solution was the take-home assignment — a process that often led to candidate dropout because top-tier talent simply doesn't have 10 hours to spend on a hypothetical context they haven't been briefed on. The industry is now witnessing a massive shift. A modern Skill-based Hiring Platform like Merito is doing away with boring, static assessments and replacing them with real-world project simulations.",
      "A Skill-based Hiring Platform solves the assessment problem by integrating evaluations directly into the interview process through AI simulations. Instead of a sales candidate preparing a 20-slide strategy deck over a weekend, an AI-powered interview can now simulate a high-pressure sales scenario in real-time.",
      "Efficiency is the hallmark of a top-tier AI recruitment agency. At Merito, we leverage an AI stack that includes tools like TestGorilla and Neorecruit AI to provide objective, bias-free data. For technical roles, the platform can observe how a developer navigates a codebase or solves a logic gap in a live simulation.",
      "When a company engages in executive search, the stakes for vetting are even higher. You cannot ask a potential CTO or VP to take a 'basic test.' Our proprietary tool, Ref-Track, validates simulations by cross-referencing behavioral flags with professional history within 24–48 hours. This level of vetting is why an AI recruitment agency like ours can boast a 90% hiring success rate.",
      "Choosing a Skill-based Hiring Platform means higher completion rates (candidates are more likely to finish a 30-minute simulation than a 5-hour assignment), predictive accuracy (behavioral and skill assessments are 70% more accurate than gut-feel interviews), and reduced bias through data-backed confidence. With Merito, you stop guessing and start seeing your future team in action before the offer is even made.",
    ],
  },
  "resume-is-dead": {
    title: "The Death of the Traditional Resume: Why Skill-Based Hiring is the Future of Tech",
    titleBefore: "THE OLD RESUME",
    titleRed: "IS DEAD",
    excerpt: "The Death of the Traditional Resume: Why Skill-Based Hiring is the Future of Tech.",
    heroImage: "/insights-thumbnails/The old resume is dead.jpg",
    category: "FUTURE OF HIRING",
    type: "article",
    readTime: "6 min read",
    stats: [
      { value: "6 in 10", label: "TECH HIRES THAT FAIL" },
      { value: "85%", label: "TWO-YEAR RETENTION" },
      { value: "ZERO CV BIAS", label: "BLIND SCREENING" },
    ],
    content: [
      "For decades, the resume has been the 'golden ticket' of the hiring world. But in 2026, the document is dying. With the explosion of Generative AI, candidates have become experts at gaming the system — rewriting their CVs in seconds to ensure a perfect keyword match for any job description. If your company is still relying on a legacy ATS to filter talent, you aren't finding the best people; you're simply finding the best keyword optimizers.",
      "Most companies mistakenly believe their ATS is an AI recruitment agency tool. In reality, most are just basic search engines. Unqualified candidates stuff their resumes with keywords to rank high, while a brilliant candidate with the exact skills you need is rejected because they used a synonym. A Skill-based Hiring Platform bypasses this entirely. Instead of reading what a candidate says about themselves, it measures what they can do.",
      "While an AI recruitment agency like Merito uses technology to source the top 2% of talent within 48 hours, we don't stop at the resume. Our Skill-based Hiring Platform uses live project simulations and AI-driven conversational interviews to verify skills in real-time.",
      "The higher the stakes, the less you can trust a resume. In an executive search, relying on an ATS score is practically dangerous. Merito's representatives act as talent hunters who apply Acquired Intelligence to manually vet and verify candidates, using proprietary tools like Ref-Track.",
      "In the Indian tech ecosystem, where the volume of applications is staggering, a Skill-based Hiring Platform is no longer a luxury — it's a necessity. AI-powered simulations are 70% more predictive of job success than resume screening. By ensuring cultural fitment through data, Merito achieves an 85% two-year retention rate.",
      "By partnering with Merito, you gain more than just a recruitment agency — you gain a tech-native partner that understands how to separate the gamers from the performers. It's time to stop searching for keywords and start hiring for impact.",
    ],
  },
  "degree-doesnt-define": {
    title: "Why 60% of Fortune 500s are Ditching University Rankings for a Skill-Based Hiring Platform",
    titleBefore: "DEGREE DOESN'T",
    titleRed: "DEFINE IT",
    excerpt: "Why 60% of Fortune 500s are Ditching University Rankings for a Skill-Based Hiring Platform.",
    heroImage: "/insights-thumbnails/DEgree doesn't define it.jpg",
    category: "SKILL BASED HIRING",
    type: "article",
    readTime: "5 min read",
    stats: [
      { value: "60%", label: "OF FORTUNE 500 COMPANIES" },
      { value: "85%", label: "RETENTION RATE" },
      { value: "SKILLS OVER", label: "CREDENTIALS" },
    ],
    content: [
      "For nearly a century, the 'Ivy League' or 'IIT' stamp was the ultimate proxy for talent. But as we enter 2026, that filter is officially broken. Recent data shows that 60% of Fortune 500 companies have fundamentally restructured their hiring policies, moving away from degree-based requirements in favour of a Skill-based Hiring Platform. The reason is simple: a degree is a measure of what someone learned years ago; a skill is a measure of what they can execute today.",
      "Traditional university rankings were designed for a stable economy where a fixed set of knowledge lasted a career. Today, the half-life of a technical skill is less than five years. When you rely on a traditional recruitment agency that filters by college name, you are essentially paying for a proxy. A Skill-based Hiring Platform like Merito removes the proxy and gives you the truth.",
      "The transition from pedigree to skills is a data-heavy process. You cannot manually vet the skills of 5,000 applicants. Merito leverages an AI stack including conversational AI and experience pattern recognition to source the top 2% of talent across non-traditional pools — finding the self-taught developer or the non-MBA marketing genius that a standard recruitment agency would have automatically rejected.",
      "Even in the realm of executive search, the 'Old Boys' Network' is being dismantled. As a strategic executive search partner, Merito applies Acquired Intelligence to leadership hiring. We use proprietary tools like Ref-Track to gather 360° data from past managers and peers.",
      "If 60% of the Fortune 500 are moving toward skills-first hiring, staying with university-based filters is a competitive disadvantage. Expanding your talent pool, reducing bias, and increasing retention — candidates hired for their specific skills are 85% more likely to stay beyond two years.",
      "The shift toward a Skill-based Hiring Platform is the most significant change in the history of human resources. It marks the end of prestige hiring and the beginning of performance hiring. Merito is at the forefront of this revolution.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(articleData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = articleData[slug];
  if (!post) return {};
  return { title: `${post.title} | Merito Insights` };
}

// Icons
const SpotifyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.508 17.302c-.216.354-.675.467-1.028.249-2.831-1.73-6.395-2.121-10.59-1.163-.406.092-.812-.162-.904-.568-.092-.406.162-.812.569-.904 4.587-1.049 8.52-.596 11.698 1.348.354.216.467.675.249 1.028a.747.747 0 01-.002.001zm1.468-3.26c-.272.443-.848.583-1.291.311-3.24-1.99-8.179-2.569-11.998-1.41-.504.152-1.036-.134-1.188-.638-.152-.504.134-1.036.638-1.188 4.368-1.326 9.816-.677 13.541 1.611.442.271.583.847.311 1.29l-.013.024zm.126-3.407c-3.886-2.308-10.309-2.521-14.053-1.384-.596.181-1.224-.153-1.405-.749-.181-.596.153-1.224.749-1.405 4.3-1.305 11.393-1.054 15.864 1.601.536.318.712 1.011.394 1.547-.318.536-1.011.712-1.547.394l-.002-.004z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = articleData[slug];

  if (!post) {
    return (
      <main className="bg-[#fdf8fb] min-h-screen flex flex-col items-center justify-center gap-6 text-center px-5">
        <h1 className="font-[family-name:var(--font-poppins)] font-semibold text-[32px] text-black">
          Post not found
        </h1>
        <Link
          href="/insights"
          className="text-[#ed1a24] font-semibold hover:underline"
        >
          ← Back to Insights
        </Link>
      </main>
    );
  }

  const heroImage = post.heroImage ?? "/insights-thumbnails/insight-Hero Banner.png";

  // PODCAST LAYOUT
  if (post.type === "podcast") {
    return (
      <main className="bg-[#fdf8fb] min-h-screen pb-20">
        {/* Hero Section */}
        <div className="relative w-full h-[450px] overflow-hidden">
          <Image
            src={heroImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
          
          <div className="absolute inset-0 flex flex-col items-center pt-24 text-center px-4">
            <Link
              href="/insights"
              className="text-white/60 text-[13px] font-bold hover:text-white tracking-[2px] transition-colors"
            >
              ← BACK TO INSIGHTS
            </Link>
            
            <div className="mt-6 bg-[#ed1a24] text-white text-[11px] font-bold px-3 py-1 rounded-[2px] tracking-[2px] uppercase">
              PODCAST
            </div>
            
            <h1 className="mt-6 font-[family-name:var(--font-poppins)] font-bold text-[42px] md:text-[56px] text-white leading-[1.1] uppercase max-w-[1000px]">
              {post.titleBefore}{" "}
              <span className="text-[#ed1a24]">{post.titleRed}</span>
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-[1100px] mx-auto -mt-24 relative z-10 px-5">
          
          {/* Podcast Player Card */}
          <div className="bg-white rounded-[24px] shadow-[0px_40px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row min-h-[400px]">
            {/* Left: Host Image */}
            <div className="md:w-[45%] relative h-[300px] md:h-auto overflow-hidden group bg-gray-900">
              <Image
                src="/podcast-host.png"
                alt="Rushikesh Humbe"
                fill
                className="object-cover transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <div className="bg-[#ed1a24] px-3 py-1 rounded-[2px] text-[10px] font-bold tracking-[2px] uppercase w-fit mb-3">
                  HOSTED BY RUSHIKESH
                </div>
                <h3 className="font-[family-name:var(--font-poppins)] font-bold text-[28px] leading-tight">
                  Rushikesh Humbe
                </h3>
                <p className="text-[16px] text-white/70 mt-1">Founder, Merito</p>
              </div>
            </div>

            {/* Right: Red Player Panel */}
            <div className="md:w-[55%] bg-[#ed1a24] p-10 md:p-12 flex flex-col justify-between text-white relative">
              <div className="absolute top-10 right-10 opacity-40">
                <SpotifyIcon />
              </div>
              
              <div>
                <div className="flex items-center gap-3 text-[12px] font-bold tracking-[3px] opacity-80 uppercase">
                  <span>{post.episode}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span>{post.date}</span>
                </div>
                <h2 className="font-[family-name:var(--font-poppins)] font-bold text-[32px] md:text-[38px] mt-4 leading-[1.1] tracking-tight">
                  {post.title}
                </h2>
                <p className="mt-4 text-white/70 text-[15px] max-w-[400px] leading-relaxed">
                  Join us as we explore the intersection of talent, technology, and human intelligence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-8 mt-10">
                <button className="bg-[#1DB954] text-white font-bold text-[14px] tracking-[1px] px-8 py-4 rounded-full flex items-center justify-center gap-3 hover:bg-[#1ed760] transition-all shadow-lg active:scale-95">
                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#1DB954]">
                    <PlusIcon />
                  </div>
                  SAVE ON SPOTIFY
                </button>
                
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <PlayIcon />
                    </button>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-white rounded-full w-[35%]" />
                    </div>
                    <span className="text-[13px] font-bold opacity-80 tabular-nums">
                      {post.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Content */}
          <div className="bg-white mt-16 p-[50px] md:p-[80px] rounded-[24px] shadow-[0px_10px_40px_rgba(0,0,0,0.03)] border border-gray-50">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-[12px] font-bold text-gray-400 tracking-[4px] uppercase">TRANSCRIPT</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>
            
            <div className="flex flex-col gap-10">
              {post.content.map((para, i) => (
                <p
                  key={i}
                  className="font-[family-name:var(--font-poppins)] text-[18px] md:text-[20px] text-[#2d2d2e] leading-[1.8] font-light"
                >
                  {para}
                </p>
              ))}
            </div>

            {/* Redesigned CTA */}
            <div className="mt-16 pt-16 border-t border-gray-100 flex flex-col items-center text-center">
              <h3 className="font-[family-name:var(--font-poppins)] font-bold text-[32px] text-black uppercase tracking-tight">
                GET STARTED WITH <span className="text-[#ed1a24]">MERITO</span>
              </h3>
              <p className="text-[16px] text-[#4b4b4d] mt-4 max-w-[600px] leading-relaxed">
                Experience the perfect blend of Artificial Intelligence and Acquired Intelligence in your hiring journey.
              </p>
              <Link
                href="/contact"
                className="mt-8 bg-[#ed1a24] text-white font-bold text-[14px] tracking-[2px] px-10 py-4 rounded-full hover:bg-black transition-all duration-300 shadow-xl"
              >
                LET'S CONNECT
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ARTICLE LAYOUT (Keep as is but ensured consistency)
  return (
    <main className="bg-[#f5f5f5]">
      {/* Card container */}
      <div className="max-w-[1003px] mx-auto bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.10)] rounded-b-[16px] overflow-hidden">

        {/* Red top bar */}
        <div className="h-[6px] bg-[#ed1a24]" />

        {/* Hero image */}
        <div className="relative h-[340px] w-full">
          <Image
            src={heroImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          {/* Back + category */}
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <Link
              href="/insights"
              className="text-white/70 text-[13px] font-bold hover:text-white tracking-wider w-fit"
            >
              ← BACK TO INSIGHTS
            </Link>
            <div className="flex items-center gap-0">
              <div className="w-[4px] h-[22px] bg-[#ed1a24] mr-3 flex-shrink-0" />
              <span className="font-bold text-[13px] text-white tracking-[2px] uppercase">{post.category}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-[60px] py-[50px] flex flex-col gap-[40px]">

          {/* Title row */}
          <div className="flex gap-[60px] items-start">
            <div className="flex-1">
              <h1 className="font-[family-name:var(--font-poppins)] font-bold text-[40px] text-black leading-[115%] uppercase">
                {post.titleBefore ? (
                  <>
                    {post.titleBefore}{" "}
                    <span className="text-[#ed1a24] underline decoration-[#ed1a24]">{post.titleRed}</span>
                  </>
                ) : post.title}
              </h1>
            </div>
            <div className="w-[280px] flex-shrink-0 flex flex-col gap-4 pt-2">
              <p className="text-[15px] text-[#4b4b4d] leading-[160%]">
                {post.excerpt ?? post.content[0].slice(0, 120) + "…"}
              </p>
              <div className="h-px bg-[#e0e0e0]" />
              <span className="font-bold text-[11px] text-[#4b4b4d] tracking-[2px] uppercase">
                {post.readTime ?? post.duration ?? post.episode}
              </span>
            </div>
          </div>

          {/* Stats row (articles with stats only) */}
          {post.stats && post.stats.length >= 2 && (
            <div className="flex gap-5">
              {/* Left dark card */}
              <div className="bg-[#111] rounded-[12px] flex-1 px-[36px] py-[28px] flex flex-col gap-3">
                <span className="font-[family-name:var(--font-poppins)] font-bold text-[64px] text-[#ed1a24] leading-none">
                  {post.stats[0].value}
                </span>
                <p className="font-[family-name:var(--font-poppins)] font-bold text-[16px] text-white">
                  {post.stats[0].label}
                </p>
                <p className="text-[13px] text-white/50 leading-[155%]">
                  AI-powered hiring cuts cost per hire dramatically
                </p>
              </div>

              {/* Right bordered card */}
              <div className="relative flex-1 border-t-[3px] border-b-[3px] border-[#ed1a24] bg-white px-[28px] py-[28px] flex items-center">
                {/* Red corner dots */}
                <div className="absolute top-[-6px] left-[-6px] size-[10px] rounded-full bg-[#ed1a24]" />
                <div className="absolute top-[-6px] right-[-6px] size-[10px] rounded-full bg-[#ed1a24]" />
                <div className="absolute bottom-[-6px] left-[-6px] size-[10px] rounded-full bg-[#ed1a24]" />
                <div className="absolute bottom-[-6px] right-[-6px] size-[10px] rounded-full bg-[#ed1a24]" />

                <div className="flex items-center gap-6 w-full">
                  {/* Left half */}
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-[family-name:var(--font-poppins)] font-bold text-[48px] text-black leading-none">
                      {post.stats[1].value}
                    </span>
                    <span className="font-bold text-[13px] text-[#4b4b4d] tracking-[1px] uppercase">
                      {post.stats[1].label}
                    </span>
                  </div>
                  {/* Divider */}
                  <div className="w-px h-[60px] bg-[#ed1a24]" />
                  {/* Right half */}
                  {post.stats[2] && (
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="font-[family-name:var(--font-poppins)] font-bold text-[20px] text-black leading-tight">
                        {post.stats[2].value}
                      </span>
                      <span className="font-bold text-[13px] text-[#4b4b4d] tracking-[1px] uppercase">
                        {post.stats[2].label}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Article content */}
          <div className="flex flex-col gap-6">
            {post.content.map((para, i) => (
              <p
                key={i}
                className="font-[family-name:var(--font-poppins)] text-[16px] text-[#4b4b4d] leading-[175%]"
              >
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-[#fdf8fb] border border-gray-100 rounded-[16px] p-10 flex flex-col items-center gap-5 text-center mt-4">
            <h3 className="font-[family-name:var(--font-poppins)] font-semibold text-[24px] text-black">
              Ready to transform your hiring?
            </h3>
            <p className="text-[16px] text-[#4b4b4d] leading-[155%] max-w-[500px]">
              Talk to a Merito expert and discover how AI-powered precision hiring can work for your team.
            </p>
            <Link
              href="/contact"
              className="bg-[#ed1a24] text-white font-[family-name:var(--font-poppins)] font-semibold text-[16px] h-[50px] px-8 rounded-[8px] flex items-center justify-center hover:bg-[#c8151e] transition-colors"
            >
              Talk to an Expert
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
