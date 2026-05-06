"use client";

import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/merito-ai",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white">
      <div className="mx-auto flex max-w-[1328px] flex-col gap-10 px-5 py-14 sm:px-6 lg:px-10">
        <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:gap-20">
          <div className="flex max-w-[430px] flex-col gap-7">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Merito"
                width={121}
                height={60}
                className="h-[40px] md:h-[60px] w-auto object-contain"
                unoptimized
              />
            </Link>
            <p className="font-[family-name:var(--font-poppins)] text-[14px] md:text-[18px] font-medium leading-[1.38] text-white">
              Merito is an AI-enabled recruitment company that helps growth
              companies hire quality talent faster.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-16 lg:gap-20">
            <div className="flex flex-col gap-8">
              <span className="text-[18px] font-semibold text-[#ed1a24]">Company</span>
              <div className="flex flex-col gap-5 text-[15px] font-medium">
                <Link href="/about" className="transition-colors hover:text-[#ed1a24]">
                  About us
                </Link>
                <Link href="/meritoways" className="transition-colors hover:text-[#ed1a24]">
                  Our Approach
                </Link>
                <Link
                  href="/contact"
                  className="text-left transition-colors hover:text-[#ed1a24]"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <span className="text-[18px] font-semibold text-[#ed1a24]">Tools</span>
              <div className="flex flex-col gap-5 text-[15px] font-medium">
                <Link href="/offervault" className="transition-colors hover:text-[#ed1a24]">
                  Offer-vault
                </Link>
                <Link href="/reftrack" className="transition-colors hover:text-[#ed1a24]">
                  Ref-track
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <span className="text-[18px] font-semibold text-[#ed1a24]">Insights</span>
              <div className="flex flex-col gap-5 text-[15px] font-medium">
                <Link href="/insights" className="transition-colors hover:text-[#ed1a24]">
                  Articles
                </Link>
                <Link href="/insights" className="transition-colors hover:text-[#ed1a24]">
                  Podcasts
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 flex-shrink-0">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <a
              href="mailto:admin@merito.ai"
              className="text-[15px] font-medium underline transition-colors hover:text-[#ed1a24]"
            >
              admin@merito.ai
            </a>
          </div>
          <div className="flex items-center gap-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 flex-shrink-0">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.13a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .5h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.35a16 16 0 006.56 6.56l1.11-1.16a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            <a
              href="tel:+919767663123"
              className="text-[15px] font-medium underline transition-colors hover:text-[#ed1a24]"
            >
              +91 97676-63123
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/20 pt-6 md:flex-row">
          <p className="text-[15px] font-medium leading-[1.6] text-white">
            Copyright 2023 Merito - by Career Corner Education Pvt. Ltd
          </p>
          <div className="flex items-center gap-[10px]">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-white transition-opacity hover:opacity-70"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
