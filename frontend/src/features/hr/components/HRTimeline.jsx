import { motion } from 'framer-motion'

/**
 * HRTimeline — vertical step timeline used for employee/mentor/recruitment/leave/
 * payroll/exit/approval histories. Items: { date, title, desc?, type? }. The
 * type maps onto an accent color (or a colorFor(item) callback can be supplied).
 */
const TYPE_COLORS = {
  notice: '#0f55f7',
  checklist: '#06b6a8',
  kt: '#8b5cf6',
  interview: '#F59E0B',
  approval: '#10b981',
  payroll: '#EC4899',
  document: '#06b6a8',
  default: '#0f55f7',
}

export default function HRTimeline({ items = [], colorFor, iconFor, className = '' }) {
  return (
    <ol className={`relative space-y-5 ${className}`}>
      <span
        className="absolute bottom-3 left-[15px] top-2 w-px bg-slate-200 dark:bg-slate-700/70"
        aria-hidden="true"
      />
      {items.map((item, index) => {
        const Icon = iconFor?.(item)
        const color = colorFor ? colorFor(item) : TYPE_COLORS[item.type] || TYPE_COLORS.default
        return (
          <motion.li
            key={`${item.title}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex gap-3.5"
          >
            <span
              className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-white/90" />}
            </span>
            <div className="min-w-0 pb-0.5 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{item.date}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
              {item.desc && <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc}</p>}
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
