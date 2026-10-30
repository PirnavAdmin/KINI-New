import { useState } from "react";
import { ChevronDown, Map, Route } from "lucide-react";

export default function CareerRoadmap({ steps, nextRole }) {
  const [expanded, setExpanded] = useState(true);
  if (!steps.length && !nextRole) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-200 bg-violet-50/60 dark:border-violet-500/25 dark:bg-violet-500/10">
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"><Map className="h-4.5 w-4.5" /></span>
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">Recommended learning roadmap</span>
            {nextRole && <span className="mt-0.5 block text-xs text-violet-600 dark:text-violet-300">Next role: {nextRole}</span>}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && steps.length > 0 && (
        <div className="border-t border-violet-200/70 px-4 py-4 dark:border-violet-500/20">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={`${step}-${index}`} className="relative flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-600 text-[10px] font-bold text-white">{index + 1}</span>
                <div className="min-w-0 flex-1 rounded-xl border border-violet-100 bg-white/80 px-3 py-2 text-xs font-medium leading-5 text-slate-700 dark:border-violet-500/15 dark:bg-slate-900/50 dark:text-slate-200">
                  <Route className="mr-1.5 inline h-3.5 w-3.5 text-violet-500" />{step}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
