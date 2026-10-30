import { motion } from 'framer-motion'

/**
 * Badge — Standardized UI badge component
 *
 * Variants:
 *   default   → Gray (neutral)
 *   success   → Green
 *   warning   → Amber
 *   danger    → Red
 *   info      → Cyan/blue
 *   premium   → Gradient (blue-purple)
 *
 * Sizes:
 *   sm  → 10px text, compact
 *   md  → 11px text, default
 *   lg  → 12px text, larger
 *
 * Dot variants:
 *   Pass dot={true} to show a colored dot indicator
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    default: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-text-secondary dark:!text-slate-300',
      dot: 'bg-slate-400',
    },
    success: {
      bg: 'bg-success/10',
      text: 'text-success-dark dark:text-success-light',
      dot: 'bg-success',
    },
    warning: {
      bg: 'bg-warning/10',
      text: 'text-warning-dark dark:text-warning-light',
      dot: 'bg-warning',
    },
    danger: {
      bg: 'bg-danger/10',
      text: 'text-danger-dark dark:text-danger-light',
      dot: 'bg-danger',
    },
    info: {
      bg: 'bg-accent/10',
      text: 'text-accent-dark dark:text-accent-light',
      dot: 'bg-accent',
    },
    premium: {
      bg: 'bg-gradient-to-r from-primary/10 to-secondary/10',
      text: 'text-primary',
      dot: 'bg-primary',
    },
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 caption',
    md: 'px-2.5 py-1 caption',
    lg: 'px-3 py-1.5 text-xs',
  }

  const v = variants[variant] || variants.default
  const s = sizes[size] || sizes.md

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full
        ${v.bg} ${v.text} ${s} ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />}
      {children}
    </motion.span>
  )
}

export default Badge
