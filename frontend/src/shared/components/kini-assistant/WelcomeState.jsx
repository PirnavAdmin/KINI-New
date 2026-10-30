import { Sparkles, Wand2 } from "lucide-react";
import SuggestionCards from "./SuggestionCards";

export default function WelcomeState({ title, subtitle, suggestions = [], onPick }) {
  return (
    <div className="flex min-h-[22rem] flex-col justify-between gap-8 rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:from-slate-950 dark:to-slate-900 sm:p-8">
      <div className="grid justify-items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-[radial-gradient(circle,rgba(8,95,167,0.14),transparent_70%)] blur-2xl" />
          <div className="grid h-18 w-18 place-items-center rounded-[1.75rem] bg-gradient-to-br from-[#085FA7] via-[#0A6BB5] to-[#5CA347] text-white shadow-[0_20px_45px_rgba(8,95,167,0.18)]">
            <Wand2 className="h-8 w-8" />
          </div>
        </div>

        <div className="max-w-xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#085FA7]/10 bg-[#EDF4FC] px-3 py-1 text-[11px] font-semibold text-[#085FA7] dark:border-cyan-400/20 dark:bg-cyan-500/10 dark:text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" />
            Kini Assistant
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          Suggested prompts
        </p>
        <SuggestionCards suggestions={suggestions} onPick={onPick} compact />
      </div>
    </div>
  );
}
