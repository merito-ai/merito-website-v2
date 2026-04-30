"use client";

import { useContactModal } from "@/context/ContactModalContext";

export default function ContactTrigger({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const { openContact } = useContactModal();
  
  return (
    <button onClick={openContact} className={className}>
      {children}
    </button>
  );
}
