import { motion } from 'framer-motion'
import { ClipboardCheck, Star, Calendar, Clock, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@shared/components/SharedComponents'
import { useNavigate } from 'react-router-dom'

export default function EmployeeReviews() {
  const navigate = useNavigate()
  const reviews = [
    { id: 1, manager: 'Sarah Johnson', date: 'Jan 15, 2025', status: 'upcoming', checklist: ['Self-assessment', 'Goal review', 'Skill progress'] },
    { id: 2, manager: 'Sarah Johnson', date: 'Oct 10, 2024', status: 'completed', score: 85, checklist: ['Achievements', 'Areas to improve', 'Goals'] },
    { id: 3, manager: 'Sarah Johnson', date: 'Jul 5, 2024', status: 'completed', score: 78, checklist: ['Performance', 'Skills', 'Career growth'] },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Reviews</h1>
      <p className="text-sm text-slate-500 mb-6">Performance reviews and feedback</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }}
            className="rounded-xl border border-slate-100 dark:border-slate-700/30 bg-white dark:bg-slate-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-sm font-semibold text-slate-900 dark:text-white">{r.manager}</p><p className="text-xs text-slate-400 mt-0.5">{r.date}</p></div>
              <div className="text-right">
                {r.score ? <p className="text-lg font-bold text-slate-900 dark:text-white">{r.score}%</p> : null}
                <StatusBadge status={r.status} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.checklist.map((item, j) => (
                <span key={j} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">{item}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
