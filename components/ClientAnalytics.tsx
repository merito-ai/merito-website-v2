"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClientAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const w = window as any;
    if (typeof window !== "undefined" && Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: "page_view", page_path: pathname });
    }
  }, [pathname]);

  return null;
}
