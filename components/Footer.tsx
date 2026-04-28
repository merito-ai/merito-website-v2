import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: "https://www.figma.com/api/mcp/asset/5c4e2bc3-50cb-46e2-acda-b4548cda473e",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: "https://www.figma.com/api/mcp/asset/3957b304-bdb2-4943-8c0f-4bf773f1bef9",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: "https://www.figma.com/api/mcp/asset/73a1eff5-58fb-4245-81e5-b5a7197b37e9",
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    icon: "https://www.figma.com/api/mcp/asset/23a24c6f-9aae-4ae1-bd6d-952356b11fba",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: "https://www.figma.com/api/mcp/asset/98b28dc8-c3a0-4614-a89a-999242541256",
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
                src="https://www.figma.com/api/mcp/asset/6a443386-2f6d-4bd2-bdb5-f947a154298b"
                alt="Merito"
                width={121}
                height={60}
                className="h-[60px] w-auto object-contain"
                unoptimized
              />
            </Link>
            <p className="font-[family-name:var(--font-poppins)] text-[18px] font-medium leading-[1.38] text-white">
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
                <Link href="/contact" className="transition-colors hover:text-[#ed1a24]">
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
            <Image
              src="https://www.figma.com/api/mcp/asset/d0140a3a-ba13-4347-a2a0-44ab059e4549"
              alt="Email"
              width={26}
              height={26}
              unoptimized
            />
            <a
              href="mailto:admin@merito.ai"
              className="text-[15px] font-medium underline transition-colors hover:text-[#ed1a24]"
            >
              admin@merito.ai
            </a>
          </div>
          <div className="flex items-center gap-5">
            <Image
              src="https://www.figma.com/api/mcp/asset/eca2d5e3-b192-4694-9173-94318338d4d5"
              alt="Phone"
              width={26}
              height={26}
              unoptimized
            />
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
                className="size-6 transition-opacity hover:opacity-70"
              >
                <Image
                  src={social.icon}
                  alt={social.label}
                  width={24}
                  height={24}
                  unoptimized
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
