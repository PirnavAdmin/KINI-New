import { Video, Clock, Eye, Play } from 'lucide-react'
import { motion } from 'framer-motion'

export default function EmployeeRecordedSessions() {
  const sessions = [
    { id: 1, title: 'React Hooks - useState & useEffect', instructor: 'Sarah Chen', duration: '45:20', views: 22, date: 'Jan 10' },
    { id: 2, title: 'Express Middleware Explained', instructor: 'John Doe', duration: '38:15', views: 18, date: 'Jan 8' },
    { id: 3, title: 'Python Data Structures', instructor: 'Mike Johnson', duration: '52:30', views: 15, date: 'Jan 6' },
    { id: 4, title: 'TypeScript Basics', instructor: 'Anna Lee', duration: '41:10', views: 12, date: 'Jan 3' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Recorded Sessions</h1>
      <p className="text-sm text-slate-500 mb-6">Watch recorded class sessions</p>
      <div className="space-y-3">
        {sessions.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4 hover:border-blue-500/25 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-teal-500/10 flex items-center justify-center shrink-0"><Video className="w-5 h-5 text-blue-600" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{s.title}</h3><button className="p-1 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Play className="w-3 h-3" /></button></div>
              <p className="text-xs text-slate-400 mt-0.5">{s.instructor} · {s.date}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration}</span><span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {s.views} views</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
