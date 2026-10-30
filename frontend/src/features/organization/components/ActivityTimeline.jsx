import { motion } from 'framer-motion'
import { Clock, RefreshCw, Plus, Shield } from 'lucide-react'
 
const TYPE_ICONS = {
  update: RefreshCw,
  add: Plus,
  security: Shield,
}
 
const TYPE_COLORS = {
  update: 'bg-[#0f55f7]',
  add: 'bg-[#10B981]',
  security: 'bg-[#06b6a8]',
}
 
export default function ActivityTimeline({ activities }) {
  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50
      dark:border-slate-700/50 shadow-sm rounded-[20px] p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-[#0f55f7]" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Activity Timeline</h3>
      </div>
 
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
 
        <div className="space-y-5">
          {activities.map((item, index) => {
            const Icon = TYPE_ICONS[item.type] || RefreshCw
            const dotColor = TYPE_COLORS[item.type] || 'bg-[#0f55f7]'
 
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="relative pl-14"
              >
                {/* Timeline Dot */}
                <div className={`absolute left-3 top-1.5 w-[9px] h-[9px] rounded-full border-2 border-white
                  dark:border-slate-900 shadow-sm ${dotColor}`}
                />
 
                {/* Icon Circle */}
                <div className="absolute -left-0.5 -top-0.5 w-[35px] h-[35px] rounded-full
                  bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700
                  flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </div>
 
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">{item.timestamp}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
 