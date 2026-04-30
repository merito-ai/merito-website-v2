Multi-Plan: SEO + Git + Deploy
🚨 CRITICAL SECURITY ISSUE FIRST
.mcp.json contains Figma API key in plaintext — this file is currently untracked but must never be committed. Regenerate this key at figma.com/developers before anything else.

PLAN 1 — Git Setup & Commits
Files to create first:

.gitignore (replace/create):


# Next.js
/.next/
/out/
/build

# Dependencies
/node_modules

# Env & Secrets
.env*
.mcp.json

# TypeScript build
*.tsbuildinfo
next-env.d.ts

# OS
.DS_Store
*.pem

# Debug logs
npm-debug.log*
yarn-debug.log*

# Tool configs (local only)
.claude/
.playwright-mcp/
.vscode/
.idea/
graphify-out/
.graphify_python

# Dev screenshots & design artifacts (root PNGs)
OfferVault.png
articles-current.png
contact-updated.png
cta-current.png
faq-current.png
fullfunnel-current.png
hero-*.png
misconception-*.png
offervault-*.png
performance-current.png
proptech-*.png
reftrack-*.png
socialproof-*.png
talenteq-current.png

# Snapshot markdown (dev artifacts)
*-snapshot.md
*-current.png
*-updated.png
*-after.png
*-fixed.png

# Dev utility scripts
clean.js
generate_reftrack.js
Strategic commit order (5 commits):

#	Commit message	What's included
1	chore: project config — next, tailwind, typescript, eslint	next.config.ts, tsconfig.json, postcss.config.mjs, eslint.config.mjs, package.json, package-lock.json, .gitignore, CLAUDE.md, AGENTS.md
2	feat: global layout, styles, and reusable components	app/layout.tsx, app/globals.css, entire components/ folder
3	feat: homepage implementation	app/page.tsx, public/figma-exports/, public/homepage-6-cards-icons/, public/full-funnel-section-cards/, public/hero-graphic-merito-way.png, public/podcast-host.png
4	feat: product and info pages — OfferVault, RefTrack, MeritoWays, About, Contact	app/offervault/, app/reftrack/, app/meritoways/, app/about/, app/contact/, public/offer-vault/, public/reftrack/, public/about-us-audit/
5	feat: insights listing and blog articles	app/insights/, public/insights-thumbnails/
PLAN 2 — SEO Infrastructure
Files to create/modify:

app/layout.tsx — enhance metadata

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://merito.in"
  ),
  title: {
    default: "Merito — AI-Enabled Full-Funnel Recruitment Partner",
    template: "%s | Merito",
  },
  description: "Merito is a human-centric AI recruitment agency that blends strategic human insight with a proprietary Skill-based Hiring Platform. No resume spam. No gut-feel guesses.",
  keywords: ["recruitment agency", "AI recruitment", "talent acquisition", "skill-based hiring", "executive search", "India hiring"],
  authors: [{ name: "Merito", url: "https://merito.in" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Merito",
    title: "Merito — AI-Enabled Full-Funnel Recruitment Partner",
    description: "Human-centric AI recruitment agency. 48-hour sourcing. Top 2% talent.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Merito — AI Recruitment Partner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Merito — AI Recruitment Partner",
    description: "Human-centric AI recruitment. 48-hour sourcing.",
    images: ["/og-image.png"],
  },
  robots: {
    index: process.env.NEXT_PUBLIC_ENV !== "staging",
    follow: process.env.NEXT_PUBLIC_ENV !== "staging",
    googleBot: {
      index: process.env.NEXT_PUBLIC_ENV !== "staging",
      follow: process.env.NEXT_PUBLIC_ENV !== "staging",
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFY ?? "",
  },
};
app/robots.ts — staging blocks, production allows

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.NEXT_PUBLIC_ENV === "staging";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://merito.in";

  if (isStaging) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
app/sitemap.ts

import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://merito.in";

const staticRoutes = [
  { path: "/",           priority: 1.0,  changeFrequency: "weekly"  },
  { path: "/about",      priority: 0.7,  changeFrequency: "monthly" },
  { path: "/contact",    priority: 0.6,  changeFrequency: "monthly" },
  { path: "/meritoways", priority: 0.8,  changeFrequency: "monthly" },
  { path: "/offervault", priority: 0.8,  changeFrequency: "monthly" },
  { path: "/reftrack",   priority: 0.8,  changeFrequency: "monthly" },
  { path: "/insights",   priority: 0.9,  changeFrequency: "daily"   },
] as const;

const articleSlugs = [
  "invisible-burn", "human-centric-ai", "right-path", "choose-right",
  "ditch-internal", "retain-top-1", "modern-playbook", "slow-hiring-costs",
  "strategy-2026", "hire-from-within", "rest-to-reality", "resume-is-dead",
  "degree-doesnt-define", "acquired-intelligence-talent", "recruitment-as-sales",
  "ice-in-hiring", "improve-hiring-experience",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const articles = articleSlugs.map((slug) => ({
    url: `${BASE}/insights/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...statics, ...articles];
}
Page metadata (add to each page — examples):

// app/offervault/page.tsx
export const metadata: Metadata = {
  title: "OfferVault — Eliminate Offer Dropouts",
  description: "Merito OfferVault: transparent offer exchange platform that reduces candidate dropouts and improves offer-to-joining conversion.",
};

// app/reftrack/page.tsx
export const metadata: Metadata = {
  title: "Ref-Track — AI-Powered Reference Checks",
  description: "Automate 360° candidate reference checks with structured feedback and quantitative scoring. Faster, bias-free hiring decisions.",
};

// app/insights/page.tsx
export const metadata: Metadata = {
  title: "Insights — Recruitment & Talent Strategy",
  description: "Expert articles and podcasts on AI recruitment, talent strategy, executive search, and skill-based hiring from Merito.",
};

// app/meritoways/page.tsx
export const metadata: Metadata = {
  title: "The Merito Way — Our Hiring Process",
  description: "How Merito's AI-powered recruitment process delivers top 2% talent in 48 hours with 85% two-year retention.",
};

// app/contact/page.tsx
export const metadata: Metadata = {
  title: "Contact Merito — Start Hiring Smarter",
  description: "Talk to a Merito expert. Share your talent requirements and get a curated shortlist within 5–7 days.",
};

// app/about/page.tsx
export const metadata: Metadata = {
  title: "About Merito — Human-Centric AI Recruitment",
  description: "Merito combines artificial intelligence with acquired human expertise to deliver precise, fast, and scalable hiring for growth companies.",
};
app/not-found.tsx — custom 404

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fdf8fb] flex flex-col items-center justify-center gap-6 text-center px-5">
      <div className="w-[6px] h-[40px] bg-[#ed1a24] mx-auto" />
      <h1 className="font-[family-name:var(--font-poppins)] font-bold text-[64px] text-[#ed1a24]">404</h1>
      <p className="text-[20px] font-semibold text-black">Page not found</p>
      <p className="text-[16px] text-[#4b4b4d] max-w-[420px]">This page doesn't exist. Head back to explore Merito's platform.</p>
      <Link href="/" className="bg-[#ed1a24] text-white font-semibold px-8 py-3 rounded-[8px] hover:bg-[#c8151e] transition-colors">
        Back to Home
      </Link>
    </main>
  );
}
next.config.ts — add security headers

async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
},
PLAN 3 — Netlify Deploy (staging.merito.in)
netlify.toml

[build]
  command    = "npm run build"
  publish    = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Staging branch deploy
[context.staging]
  [context.staging.environment]
    NEXT_PUBLIC_ENV      = "staging"
    NEXT_PUBLIC_SITE_URL = "https://staging.merito.in"

# Production deploy
[context.production]
  [context.production.environment]
    NEXT_PUBLIC_ENV      = "production"
    NEXT_PUBLIC_SITE_URL = "https://merito.in"

# Cache immutable Next.js assets
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
Deploy steps:

npm install @netlify/plugin-nextjs --save-dev
Create netlify.toml above
Push to GitHub remote
Connect repo in Netlify dashboard → New site from Git
Set env vars in Netlify UI: NEXT_PUBLIC_ENV, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_GOOGLE_VERIFY
Add custom domain staging.merito.in in Netlify → Domain settings
Point DNS: CNAME staging → <your-netlify-site>.netlify.app
PLAN 4 — Good Practices Checklist
Item	Priority	Notes
public/og-image.png	HIGH	1200×630px OG social share image — create from Figma
public/favicon.ico + public/icon.png	HIGH	Site favicon
Google Search Console setup	HIGH	Add verification tag after deploy
app/privacy/page.tsx stub	MEDIUM	Required for DPDPA India compliance
app/terms/page.tsx stub	MEDIUM	Trust signal for SEO
Alt text audit on all <Image>	MEDIUM	Many Figma exports have empty alt=""
NEXT_PUBLIC_GA_ID env var	MEDIUM	For Google Analytics if not already wired
GitHub Actions CI	LOW	Lint + build check on every PR
Execution order:

Regenerate Figma API key
Create .gitignore → verify .mcp.json excluded
Create netlify.toml + install plugin
Add SEO files (robots.ts, sitemap.ts, not-found.tsx)
Update layout.tsx + add page metadata
Update next.config.ts headers
Make 5 strategic commits
Create GitHub repo → push
Connect Netlify → deploy staging
Ready to execute any phase — which first?

\temp\readonly\Agent tool input (6gje5g)
execute one by one /everything-claude-code:multi-execute
The user wants to execute the plans one by one. They're invoking /everything-claude-code:multi-execute which doesn't exist in the skills list. The closest skill would be superpowers:execute-plan or everything-claude-code:plan.

Since the user is saying "execute one by one", I should start executing the plans in order:

Regenerate Figma API key (can't do - user must do this)

Create .gitignore

Create netlify.toml + install plugin

Add SEO files

Update layout.tsx + page metadata

Update next.config.ts headers

Make 5 strategic commits

Create GitHub repo → push

Connect Netlify → deploy staging

I'll work through these systematically, starting with checking the current .gitignore state and then progressing through each step.

The user wants to execute the plans. Let me set up a todo list and start executing. The execution order is:

Fix .gitignore (create with proper content)
Create netlify.toml + install @netlify/plugin-nextjs
Create app/robots.ts
Create app/sitemap.ts
Create app/not-found.tsx
Update app/layout.tsx (metadata)
Update next.config.ts (security headers)
Add page metadata to each page (6 pages)
Create GitHub repo + push
Strategic commits
Note: Step about regenerating Figma API key - I need to tell the user to do that themselves.

Let me start working through the execution plan. First, I'll check what's currently in the .gitignore file to see what needs to be updated.

Update Todos

Create .gitignore

Create netlify.toml + install @netlify/plugin-nextjs

Create app/robots.ts (staging blocks, prod allows)

Create app/sitemap.ts (all routes + articles)

Create app/not-found.tsx custom 404

Update app/layout.tsx — OG tags, canonical, structured data, env-aware robots

Update next.config.ts — security headers

Add page metadata to 6 pages (insights, offervault, reftrack, meritoways, contact, about)

Create GitHub repo + set remote

Make 5 strategic commits and push
Bash Check existing .gitignore
IN
cat c:\Users\LENOVO\Desktop\merito-website\.gitignore 2>/dev/null || echo "NO_GITIGNORE"

OUT
NO_GITIGNORE
Write c:\Users\LENOVO\Desktop\merito-website\.gitignore
Write failed
# Next.js
/.next/
/out/
/build

# Dependencies
/node_modules

# Env & Secrets — NEVER COMMIT
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
.mcp.json

# TypeScript build artifacts
*.tsbuildinfo
next-env.d.ts

# OS
.DS_Store
Thumbs.db
*.pem

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local tool configs
.claude/
.playwright-mcp/
.vscode/
.idea/
*.swp
*.swo

# Dev/generated artifacts
graphify-out/
.graphify_python

# Dev utility scripts (not for production)
clean.js
generate_reftrack.js

# Root-level design screenshots (dev artifacts)
OfferVault.png
articles-current.png
contact-updated.png
cta-current.png
faq-current.png
fullfunnel-current.png
hero-1440-top.png
hero-1440.png
hero-after-css-fix.png
hero-current.png
hero-fixed.png
misconception-after.png
misconception-cards.png
misconception-current.png
offervault-current.png
offervault-page.png
offervault-snapshot.md
performance-current.png
proptech-current.png
proptech-row2.png
reftrack-current.png
reftrack-snapshot.md
reftrack-updated.png
socialproof-after.png
socialproof-current.png
talenteq-current.png

# Netlify
.netlify/

# Vercel
.vercel
Bash Create empty .gitignore so Write tool can write it
IN
touch c:\Users\LENOVO\Desktop\merito-website\.gitignore && cat c:\Users\LENOVO\Desktop\merito-website\.gitignore

OUT
(Bash completed with no output)
Read c:\Users\LENOVO\Desktop\merito-website\.gitignore
Good, there's already a .gitignore. I need to add the additional entries to it. Let me append the missing entries.

Good — base .gitignore exists. Appending missing entries:

Edit c:\Users\LENOVO\Desktop\merito-website\.gitignore
Edit failed
Facts for .gitignore:

Imports: No files import .gitignore — it's a git config file read only by git CLI.
Public functions/classes: None — not source code.
Data files: None — file contains only glob patterns.
User's instruction verbatim: "execute one by one /everything-claude-code:multi-execute"
Edit c:\Users\LENOVO\Desktop\merito-website\.gitignore
Added 56 lines
Update Todos

Create .gitignore

Create netlify.toml + install @netlify/plugin-nextjs

Create app/robots.ts (staging blocks, prod allows)

Create app/sitemap.ts (all routes + articles)

Create app/not-found.tsx custom 404

Update app/layout.tsx — OG tags, canonical, env-aware robots

Update next.config.ts — security headers

Add page metadata to 6 pages

Create GitHub repo + set remote

Make 5 strategic commits and push
Now netlify.toml + plugin install:

Bash Install Netlify Next.js plugin
IN
cd c:\Users\LENOVO\Desktop\merito-website && npm install @netlify/plugin-nextjs --save-dev 2>&1 | tail -5

OUT
Exit code 1
/usr/bin/bash: line 1: cd: c:UsersLENOVODesktopmerito-website: No such file or directory
Bash Install Netlify Next.js plugin
IN
cd "/c/Users/LENOVO/Desktop/merito-website" && npm install @netlify/plugin-nextjs --save-dev 2>&1 | tail -5

OUT
To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
Bash Check if netlify.toml exists
IN
ls /c/Users/LENOVO/Desktop/merito-website/netlify.toml 2>/dev/null && echo "EXISTS" || echo "MISSING"

OUT
MISSING
Write c:\Users\LENOVO\Desktop\merito-website\netlify.toml
Write failed
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Staging branch
[context.staging]
  [context.staging.environment]
    NEXT_PUBLIC_ENV      = "staging"
    NEXT_PUBLIC_SITE_URL = "https://staging.merito.in"

# Production
[context.production]
  [context.production.environment]
    NEXT_PUBLIC_ENV      = "production"
    NEXT_PUBLIC_SITE_URL = "https://merito.in"

# Cache immutable Next.js static assets
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options        = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection       = "1; mode=block"
    Referrer-Policy        = "strict-origin-when-cross-origin"
Let me resume from where we left off. The pending task was creating netlify.toml. Let me check the current state of files and continue.

Globpattern: "netlify.toml"
No files found
Write c:\Users\LENOVO\Desktop\merito-website\netlify.toml
33 lines
[build]
  command = "npm run build"
  publish = ".next"
