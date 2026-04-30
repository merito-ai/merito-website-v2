import type { Metadata } from "next";
import { Poppins, Gabarito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import ClientAnalytics from "@/components/ClientAnalytics";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
});

const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gabarito",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://merito.in"
  ),
  title: {
    default: "Merito — AI-Enabled Full-Funnel Recruitment Partner",
    template: "%s | Merito",
  },
  description: "Merito is a human-centric AI recruitment agency that blends strategic human insight with a proprietary Skill-based Hiring Platform. No resume spam. No gut-feel guesses.",
  keywords: [
    "recruitment agency",
    "AI recruitment",
    "talent acquisition",
    "skill-based hiring",
    "executive search",
    "India hiring",
  ],
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

import { ContactModalProvider } from "@/context/ContactModalContext";
import ContactModal from "@/components/ContactModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* GA4 */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GTAG_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        {/* Zoho SalesIQ */}
        <Script id="zoho-init" strategy="afterInteractive">
          {`
            window.$zoho=window.$zoho || {};
            $zoho.salesiq=$zoho.salesiq||{ready:function(){}}
          `}
        </Script>
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.in/widget?wc=siq60bd6a01da5298e0b5a2257627058c326d697a43094bec2499eb32efa03229e0"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${poppins.variable} ${gabarito.variable} antialiased`}>
        <ContactModalProvider>
          <Navbar />
          <ClientAnalytics />
          <ContactModal />
          {children}
          <Footer />
        </ContactModalProvider>
      </body>
    </html>
  );
}

