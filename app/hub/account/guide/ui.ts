// Shared button looks for the Hub dashboard guide (hero, sticky phone button, plans popup).
// Primary red is a shade darker than #ed1a24 so white 14px text clears 4.5:1; red text on dark uses #ff7a80.
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const BASE = `inline-flex items-center justify-center gap-2 font-[family-name:var(--font-poppins)] font-semibold rounded-lg min-h-[44px] px-5 text-[14px] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-default ${FOCUS}`;
export const BTN_PRIMARY = `${BASE} text-white bg-[#d9161f] hover:bg-[#c8151e] border-0`;
export const BTN_GHOST = `${BASE} text-white bg-transparent border border-white/20 hover:border-white/45`;
export const BTN_MINI = `inline-flex items-center font-[family-name:var(--font-poppins)] font-semibold text-[12.5px] text-white border border-white/20 hover:border-white/45 rounded-md min-h-[44px] px-3.5 transition-colors ${FOCUS}`;
export const FONT_HEAD = "font-[family-name:var(--font-gabarito)]";
export const FONT_BODY = "font-[family-name:var(--font-poppins)]";

// "Switch role" links open the existing TopBar role switcher (dropdown, or "+ Check a new role" with one role).
export function openRoleSwitcher() {
  const trigger = document.querySelector<HTMLButtonElement>("[data-role-switcher]");
  trigger?.focus();
  trigger?.click();
}
