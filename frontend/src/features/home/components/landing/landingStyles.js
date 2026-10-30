// Shared class strings for the landing page so CTAs, containers and headings
// look the same in every section. Colours follow the app tokens in index.css
// (navy #133B5D, orange #F39924).
export const CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8";

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#133B5D] focus-visible:ring-offset-2";

const BTN_BASE = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${FOCUS_RING}`;

export const BTN_PRIMARY = `${BTN_BASE} bg-[#F39924] text-[#133B5D] hover:bg-[#F7AE4F]`;
export const BTN_SECONDARY = `${BTN_BASE} border border-[#133B5D]/20 bg-white text-[#133B5D] hover:border-[#133B5D]/40 hover:bg-[#133B5D]/[0.04]`;
export const BTN_ON_DARK = `${BTN_BASE} border border-white/25 text-white hover:bg-white/10 focus-visible:ring-[#F39924] focus-visible:ring-offset-[#133B5D]`;

const LG = "min-h-12 px-7 text-[15px]";
export const BTN_PRIMARY_LG = `${BTN_PRIMARY} ${LG} shadow-[0_12px_24px_-12px_rgba(243,153,36,0.8)]`;
export const BTN_SECONDARY_LG = `${BTN_SECONDARY} ${LG}`;
export const BTN_ON_DARK_LG = `${BTN_ON_DARK} ${LG}`;

// Accent for large display text on light backgrounds (orange #F39924 itself is
// below 3:1 on white, so headings use this deeper tone).
export const ACCENT_TEXT = "text-[#C2700A]";

export const EYEBROW = "text-xs font-semibold uppercase tracking-[0.16em] text-[#9A5A06]";
export const EYEBROW_DARK = "text-xs font-semibold uppercase tracking-[0.16em] text-[#F7B45C]";

export const DISPLAY_FONT = "font-['Sora',Inter,system-ui,sans-serif]";
