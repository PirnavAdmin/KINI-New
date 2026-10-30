import { PanelRightClose, PanelRightOpen, Sparkles, Trash2, X } from "lucide-react";

export default function AssistantHeader({
  messageCountLabel,
  insightsOpen,
  onToggleInsights,
  onClearChat,
  onClose,
}) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200/80 bg-white/78 px-4 py-3 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/78 sm:px-5 sm:py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#085FA7] to-[#5CA347] text-white shadow-[0_12px_28px_rgba(8,95,167,0.22)]">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[15px] font-semibold tracking-tight text-slate-950 dark:text-white">
                Kini Assistant
              </h1>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                AI Learning Copilot
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live backend connected
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium dark:bg-slate-900">
                {messageCountLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onClearChat}
          aria-label="Clear chat"
          className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          title="Clear chat"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleInsights}
          aria-label={insightsOpen ? "Collapse insights" : "Expand insights"}
          className="hidden grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white lg:grid"
          title={insightsOpen ? "Collapse insights" : "Expand insights"}
        >
          {insightsOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Kini Assistant"
          className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
