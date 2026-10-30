import { motion } from 'framer-motion'
import { Target, CheckCircle, CircleDot, Clock } from 'lucide-react'
import { StatusBadge } from '@shared/components/SharedComponents'

export default function EmployeeGoals() {
  const goals = [
    { id: 1, title: 'Complete Full Stack Certification', progress: 65, status: 'in-progress', dueDate: 'Mar 2025' },
    { id: 2, title: 'Improve Python to Advanced Level', progress: 40, status: 'in-progress', dueDate: 'Jun 2025' },
    { id: 3, title: 'Lead 3 team projects', progress: 100, status: 'completed', dueDate: 'Jan 2025' },
    { id: 4, title: 'Obtain AWS Certification', progress: 25, status: 'in-progress', dueDate: 'Apr 2025' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">My Goals</h1>
      <p className="text-sm text-slate-500 mb-6">Track your professional goals</p>
      <div className="space-y-3">
        {goals.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${g.status === 'completed' ? 'bg-teal-100 dark:bg-teal-500/15' : 'bg-blue-100 dark:bg-blue-500/15'}`}>
                {g.status === 'completed' ? <CheckCircle className="w-5 h-5 text-teal-600" /> : <CircleDot className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</p><StatusBadge status={g.status === 'in-progress' ? 'active' : g.status} /></div>
                <div className="mt-2 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500" style={{ width: `${g.progress}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{g.progress}% · Due {g.dueDate}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
