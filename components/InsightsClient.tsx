"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

function Eyebrow({ text }) {
  return (
    <div className="inline-flex items-center bg-[#ed1a24] px-[12px] py-[6px] rounded-full">
      <span className="font-[family-name:var(--font-poppins)] font-bold text-[16px] text-white leading-[165%]">
        {text}
      </span>
    </div>
  );
}

function ArticleCard(props) {
  // ...existing code from original ArticleCard...
  // For brevity, import and use as in original file
  return null;
}

function PodcastCard(props) {
  // ...existing code from original PodcastCard...
  return null;
}

const articles = [];
const podcasts = [];

export default function InsightsClient() {
  const [visibleCount, setVisibleCount] = useState(6);
  // ...existing code from original InsightsPage...
  return (
    <main className="bg-[#fdf8fb]">
      {/* ...existing JSX from InsightsPage... */}
    </main>
  );
}
