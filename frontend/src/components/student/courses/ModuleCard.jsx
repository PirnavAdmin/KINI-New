import { CheckCircle2, Lock, PlayCircle, ClipboardCheck } from "lucide-react";

export default function ModuleCard({ module, index, locked, videosComplete, passed, onOpen, onAssignment }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${locked ? "border-slate-200 bg-slate-50/80 opacity-75 dark:border-slate-800 dark:bg-slate-900/40" : "border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-900/70"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f55f7]/10 text-sm font-bold text-[#0f55f7]">{index + 1}</span>
            <h3 className="text-base font-bold text-slate-950 dark:text-white">{module.title}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{module.subtitle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {module.topics?.map((topic) => (
              <span key={topic} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{topic}</span>
            ))}
          </div>
        </div>
        {locked ? <Lock className="h-5 w-5 text-slate-400" /> : passed ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button disabled={locked} onClick={onOpen} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
          <PlayCircle className="h-4 w-4" />
          Watch videos
        </button>
        <button disabled={locked || !videosComplete} onClick={onAssignment} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">
          <ClipboardCheck className="h-4 w-4" />
          {videosComplete ? "Open assignment" : "Assignment locked"}
        </button>
      </div>
    </div>
  );
}
