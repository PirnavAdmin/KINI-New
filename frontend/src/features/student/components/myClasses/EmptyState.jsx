import { motion } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'

export default function EmptyState({ onBrowseCourses }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[42vh] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/60"
    >
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,rgba(15,85,247,0.12),rgba(124,58,237,0.12),rgba(6,182,168,0.12))]">
          <BookOpen className="h-9 w-9 text-[#0f55f7]" />
        </div>
        <Sparkles className="absolute -right-2 -top-2 h-6 w-6 text-[#06b6a8]" />
      </div>
      <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-white">No Classes Available</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        You don&apos;t have any scheduled classes matching the current filters.
      </p>
      <button
        type="button"
        onClick={onBrowseCourses}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(15,85,247,0.22)] transition-all hover:brightness-105"
      >
        Browse Courses
      </button>
    </motion.div>
  )
}
