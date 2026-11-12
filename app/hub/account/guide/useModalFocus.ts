"use client";

import { useEffect, type KeyboardEvent, type RefObject } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// aria-modal dialogs: focus moves in on open ([data-autofocus] first), Tab stays inside, Esc closes,
// focus returns to the opener on close. Returns the panel's onKeyDown (React bubbling lets a nested dialog stop it).
export function useModalFocus(panel: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const el = panel.current;
    (el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(FOCUSABLE) ?? el)?.focus();
    return () => opener?.focus?.();
  }, [panel]);

  return (e: KeyboardEvent) => {
    // A dialog opened on top of this one (e.g. the plan confirm) handles its own keys.
    if ((e.target as HTMLElement).closest('[aria-modal="true"]') !== panel.current) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
}
