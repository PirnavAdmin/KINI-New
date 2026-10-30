import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function ErrorState({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[42vh] flex-col items-center justify-center rounded-[28px] border border-rose-200/70 bg-white/90 px-6 py-12 text-center shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-rose-500/20 dark:bg-slate-900/80"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-rose-500/10 text-rose-500">
        <AlertTriangle className="h-9 w-9" />
      </div>
      <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Unable to load classes</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        We could not render the class list right now. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,85,247,0.22)] transition-all hover:brightness-105"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry
      </button>
    </motion.div>
  )
}
