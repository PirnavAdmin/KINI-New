import { motion } from 'framer-motion'
import {
  CalendarDays,
  Video,
  FileText,
  ClipboardCheck,
  Users,
  TrendingUp,
} from 'lucide-react'

const STAT_CARDS = [
  { key: 'total', label: 'Total Events', icon: CalendarDays, color: 'violet' },
  { key: 'live-classes', label: 'Live Classes', icon: Video, color: 'emerald' },
  { key: 'assignments', label: 'Assignments', icon: FileText, color: 'amber' },
  { key: 'assessments', label: 'Assessments', icon: ClipboardCheck, color: 'blue' },
  { key: 'meetings', label: 'Meetings', icon: Users, color: 'rose' },
]

const accentMap = {
  violet: { bg: 'bg-violet-50 dark:bg-violet-500/10', iconBg: 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400', trend: 'text-violet-600 dark:text-violet-400', spark: '#8B5CF6' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', iconBg: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', trend: 'text-emerald-600 dark:text-emerald-400', spark: '#10B981' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', trend: 'text-amber-600 dark:text-amber-400', spark: '#F59E0B' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', trend: 'text-blue-600 dark:text-blue-400', spark: '#3B82F6' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-500/10', iconBg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400', trend: 'text-rose-600 dark:text-rose-400', spark: '#F43F5E' },
}

export default function CalendarStats({ events = [] }) {
  const counts = {
    total: events.length,
    'live-classes': events.filter((event) => event.type === 'live-class').length,
    assignments: events.filter((event) => event.type === 'assignment').length,
    assessments: events.filter((event) => event.type === 'assessment').length,
    meetings: events.filter((event) => event.type === 'meeting').length,
  }
  const trends = { total: '+12%', 'live-classes': '+8%', assignments: '+5%', assessments: '+15%', meetings: '+3%' }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {STAT_CARDS.map((stat, index) => {
        const accent = accentMap[stat.color]
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`group relative cursor-default overflow-hidden rounded-xl border border-transparent border-t-[3px] px-3 py-2.5 transition-all duration-300 hover:-translate-y-px hover:shadow-md dark:hover:border-slate-700/30 ${accent.bg}`}
            style={{ borderTopColor: accent.spark }}
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-gradient-to-br from-white/30 to-transparent blur-xl dark:from-white/5" />
            <div className="flex min-h-[48px] items-center gap-2.5">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105 ${accent.iconBg}`}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1"><div className="flex items-end justify-between gap-1"><p className="text-lg font-bold leading-none tabular-nums text-slate-900 dark:text-white">{counts[stat.key]}</p><span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold ${accent.trend}`}><TrendingUp className="h-2.5 w-2.5" />{trends[stat.key]}</span></div><span className="mt-1 block truncate text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</span></div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
