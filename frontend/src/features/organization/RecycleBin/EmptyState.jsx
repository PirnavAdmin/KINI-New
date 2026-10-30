import { RefreshCw, Trash2 } from 'lucide-react'

export default function EmptyState({ onRefresh, refreshing = false }) {
  return (
    <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-dashed border-slate-200/80 bg-white/80 px-6 py-8 text-center shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] dark:border-slate-700/70 dark:bg-slate-900/60">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 text-[#0f55f7]">
          <Trash2 className="h-7 w-7" />
        </div>
        <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-white">
          Recycle Bin is Empty
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          There are no deleted records to display.
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(15,85,247,0.16)] transition-all hover:-translate-y-0.5 hover:scale-[1.01] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  )
}
