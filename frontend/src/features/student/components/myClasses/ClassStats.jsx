import { motion } from 'framer-motion'
import { CalendarDays, Clock3, CheckCircle2, Radio } from 'lucide-react'
import { CountUp } from '@shared/hooks/useCountUp'

const STATS = {
  totalClasses: { icon: CalendarDays, accent: 'from-[#8b5cf6] to-[#6d28d9]' },
  upcoming: { icon: Clock3, accent: 'from-[#0f55f7] to-[#2563eb]' },
  live: { icon: Radio, accent: 'from-[#06b6a8] to-[#10b981]' },
  completed: { icon: CheckCircle2, accent: 'from-[#f59e0b] to-[#fb7185]' },
}

export default function ClassStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
      {stats.map((item, index) => {
        const config = STATS[item.key] || STATS.totalClasses
        const Icon = config.icon

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="group min-h-[124px] rounded-[18px] border border-white/70 bg-white px-3 py-2.5 shadow-[0_6px_14px_rgba(15,23,42,0.035)] ring-1 ring-slate-900/[0.03] backdrop-blur-xl transition-all dark:border-slate-700/60 dark:bg-slate-900/80"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-[0_6px_14px_rgba(15,23,42,0.1)]`}>
                <Icon className="h-4 w-4" />
              </div>
              {item.trend ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.trend > 0 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-slate-500/10 text-slate-700 dark:text-slate-300'}`}>
                  {item.trend > 0 ? '+' : ''}{item.trend}%
                </span>
              ) : null}
            </div>

            <div className="mt-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
              <p className="mt-1 text-[1.9rem] font-black leading-none tracking-tight text-slate-900 dark:text-white">
                <CountUp end={Number(item.value || 0)} duration={1.6} />
              </p>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{item.helper}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
