"use client";

import { useState } from "react";
import { LockOpen } from "lucide-react";
import PlansPopup from "./PlansPopup";
import { BTN_PRIMARY } from "./ui";

// Every "Unlock plans" entry point (dashboard hero, sticky phone button, paywall modals, locked pages) opens the same popup.
export default function UnlockPlansButton({ className = BTN_PRIMARY, label = "Unlock plans" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={className}>
        <LockOpen size={16} strokeWidth={2} aria-hidden="true" />
        {label}
      </button>
      {open && <PlansPopup onClose={() => setOpen(false)} />}
    </>
  );
}
