import { BRAND } from "../theme";

// Shared class names / formatters for the public enrollment payment pages.

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonStyle = { backgroundColor: BRAND.accent };

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/15 dark:bg-transparent dark:text-slate-200 dark:hover:text-white";

export const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200 aria-[invalid=true]:border-rose-400 dark:border-white/15 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-500/30";

export const formatRupees = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
