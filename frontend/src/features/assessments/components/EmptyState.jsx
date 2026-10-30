import { motion } from 'framer-motion'
import { ClipboardCheck, ClipboardList, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EmptyState({ message = 'No assessment results found.' }) {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6">
          <ClipboardCheck className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Results Yet</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">{message}</p>
        <button
          onClick={() => navigate('/student/assessments')}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#2563EB]/20"
        >
          <ClipboardList className="w-4 h-4" />
          Take an Assessment
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
