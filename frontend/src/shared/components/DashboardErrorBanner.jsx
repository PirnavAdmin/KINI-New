import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardErrorBanner({ error, onRetry, message = 'Unable to load dashboard statistics.' }) {
  if (!error) return null

  return (
    <div role="alert" className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex min-w-0 items-center gap-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden="true" />
        <p className="truncate font-medium">{message}</p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 dark:border-amber-400/30 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-amber-500/10">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </div>
  )
}
