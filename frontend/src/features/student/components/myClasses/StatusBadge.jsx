import { motion } from 'framer-motion'

const STATUS_STYLES = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  live: {
    label: 'Live',
    className: 'bg-emerald-500/12 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  missed: {
    label: 'Missed',
    className: 'bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300',
    dot: 'bg-slate-500',
  },
}

export default function StatusBadge({ status = 'upcoming', label, pulse = false, className = '' }) {
  const variant = STATUS_STYLES[status] || STATUS_STYLES.upcoming

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${variant.className} ${className}`}
    >
      <span className={`relative flex h-2 w-2 rounded-full ${variant.dot}`}>
        {pulse && status === 'live' && (
          <span className="absolute inset-0 rounded-full bg-emerald-500/50 animate-ping" />
        )}
      </span>
      {label || variant.label}
    </motion.span>
  )
}
