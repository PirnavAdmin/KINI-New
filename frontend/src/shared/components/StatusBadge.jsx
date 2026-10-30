import { motion } from 'framer-motion'

const VARIANTS = {
  active: {
    bg: 'bg-[#06b6a8]/10',
    text: 'text-[#06b6a8]',
    dot: 'bg-[#06b6a8]',
  },
  inactive: {
    bg: 'bg-slate-200 dark:bg-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-500',
  },
  rejected: {
    bg: 'bg-rose-100 dark:bg-rose-950/50',
    text: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-600',
  },
  pending: {
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
  success: {
    bg: 'bg-[#06b6a8]/10',
    text: 'text-[#06b6a8]',
    dot: 'bg-[#06b6a8]',
  },
  warning: {
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    dot: 'bg-[#F59E0B]',
  },
  danger: {
    bg: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
    dot: 'bg-[#EF4444]',
  },
  live: {
    bg: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
    dot: 'bg-[#EF4444]',
  },
  default: {
    bg: 'bg-slate-100 dark:bg-slate-700',
    text: 'text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
}

export default function StatusBadge({ status = 'default', label, dot = true, size = 'sm', pulse = false }) {
  const variant = VARIANTS[status] || VARIANTS.default
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1)

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-[11px]'
    : 'px-3 py-1.5 text-xs'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      aria-label={`Status: ${displayLabel}`}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizeClasses} ${variant.bg} ${variant.text}`}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          {pulse && (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${variant.dot}`} />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${variant.dot}`} />
        </span>
      )}
      {displayLabel}
    </motion.span>
  )
}

