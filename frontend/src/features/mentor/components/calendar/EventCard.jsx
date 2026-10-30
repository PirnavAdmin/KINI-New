import { motion } from 'framer-motion'
import {
  Presentation,
  FileText,
  ClipboardCheck,
  Users,
  Monitor,
  Wrench,
  Clock,
  GraduationCap,
  Bell,
} from 'lucide-react'

const iconMap = {
  presentation: Presentation,
  'file-text': FileText,
  'clipboard-check': ClipboardCheck,
  users: Users,
  monitor: Monitor,
  wrench: Wrench,
  clock: Clock,
  'graduation-cap': GraduationCap,
  bell: Bell,
}

export default function EventCard({ event, compact = false, onClick }) {
  const Icon = iconMap[event.icon] || Clock

  if (compact) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className="group flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium transition-all hover:shadow-sm"
        style={{ backgroundColor: event.bgColor || '#F0FDF4', color: event.textColor || '#059669' }}
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: event.color || '#10B981' }} />
        {event.time && <span className="shrink-0 text-[9px] font-semibold opacity-75">{event.time.split(' - ')[0]}</span>}
        <span className="ml-0.5 truncate">{event.title}</span>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
      onClick={onClick}
      className="group flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 transition-all hover:border-opacity-50 dark:border-slate-700/20 dark:bg-slate-900/60"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: event.bgColor || '#F0FDF4' }}>
        <Icon className="h-4 w-4" style={{ color: event.textColor || '#059669' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900 transition-colors group-hover:text-violet-600 dark:text-white">{event.title}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">{event.time}</span>
          {event.course && <><span className="text-[10px] text-slate-300">·</span><span className="truncate text-[10px] text-slate-400">{event.course}</span></>}
        </div>
      </div>
    </motion.div>
  )
}
