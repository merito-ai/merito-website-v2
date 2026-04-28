"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

type Props = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
};

function ChevronDown() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

export default function AccordionItem({
  title,
  children,
  defaultOpen = false,
  isOpen,
  onToggle,
  className = "",
  contentClassName = "",
  headerClassName = "",
}: Props) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  const toggle = isControlled ? onToggle : () => setInternalOpen((v) => !v);

  const reduce = useReducedMotion();
  const dur = reduce ? 0 : 0.28;

  return (
    <div className={className} data-open={open}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className={`flex w-full items-start justify-between gap-4 text-left ${headerClassName}`}
      >
        <div className="flex-1">{title}</div>
        <span
          className="mt-1 shrink-0 text-black transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDown />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
            className={contentClassName}
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
