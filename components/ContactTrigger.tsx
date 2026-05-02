"use client";

import Link from "next/link";

export default function ContactTrigger({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <Link href="/contact" className={className}>
      {children}
    </Link>
  );
}
