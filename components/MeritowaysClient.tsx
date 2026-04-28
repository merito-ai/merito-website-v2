"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

function Eyebrow({ text }) {
  return (
    <div className="inline-flex items-center bg-[#ed1a24] px-[12px] py-[6px] rounded-full">
      <span className="font-[family-name:var(--font-poppins)] font-bold text-[12px] md:text-[14px] tracking-wider text-white leading-none uppercase">
        {text}
      </span>
    </div>
  );
}

// ...other icon and data definitions from original file...

export default function MeritowaysClient() {
  const pillarsRef = useRef(null);
  const [pillarsVisible, setPillarsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPillarsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (pillarsRef.current) {
      observer.observe(pillarsRef.current);
    }
    return () => observer.disconnect();
  }, []);
  // ...existing code from original MeritowaysPage...
  return (
    <main className="bg-[#fdf8fb] overflow-hidden">
      {/* ...existing JSX from MeritowaysPage... */}
    </main>
  );
}
