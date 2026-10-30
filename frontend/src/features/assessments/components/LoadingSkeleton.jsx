



import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="space-y-2">
          <div className="w-48 h-5 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="w-32 h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />

      {/* Summary grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 h-72 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>

      {/* Topic analysis skeleton */}
      <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />

      {/* Bottom actions skeleton */}
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
