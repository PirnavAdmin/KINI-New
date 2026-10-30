import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message, onRetry, retrying = false }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/90 px-6 py-10 text-center dark:border-rose-500/20 dark:bg-rose-500/10">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm dark:bg-slate-900/80">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-xl font-black text-rose-700 dark:text-rose-200">
          Failed to load recycle bin.
        </h3>
        <p className="mt-2 text-sm leading-6 text-rose-700/80 dark:text-rose-100/80">
          {message || 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-500/20 dark:bg-slate-900 dark:text-rose-200"
        >
          <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
          Retry
        </button>
      </div>
    </div>
  )
}
