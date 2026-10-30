import { motion } from 'framer-motion'

/**
 * HRMiniBars — dependency-free animated bar chart (CSS only) used for trend /
 * distribution panels (attendance trend, leave trend, growth, coverage, ratings…).
 * data: [{ label, value }]; `valueKey`/`labelKey` can override the field names.
 */
export default function HRMiniBars({
  data = [],
  valueKey = 'value',
  labelKey = 'label',
  color = '#0f55f7',
  barHeight = 'h-24',
  showValue = true,
  valueFormatter,
  className = '',
}) {
  const max = Math.max(1, ...data.map((d) => Number(d[valueKey]) || 0))

  return (
    <div className={`flex items-end justify-between gap-2 ${className}`}>
      {data.map((d, index) => {
        const value = Number(d[valueKey]) || 0
        const pct = (value / max) * 100
        return (
          <div key={`${d[labelKey]}-${index}`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            {showValue && (
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {valueFormatter ? valueFormatter(value) : value}
              </span>
            )}
            <div className={`flex w-full items-end justify-center rounded-lg bg-slate-100/70 dark:bg-slate-800/60 ${barHeight}`}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, pct)}%` }}
                transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-lg"
                style={{ background: `linear-gradient(180deg, ${color}, ${color}88)` }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] font-semibold text-slate-400">
              {d[labelKey]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
