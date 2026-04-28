"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClientAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (typeof window !== "undefined" && w.gtag) {
      w.gtag("config", process.env.NEXT_PUBLIC_GTAG_ID, { page_path: pathname });
    }
  }, [pathname]);

  return null;
}