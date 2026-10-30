import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ErrorState({ message = 'Unable to load assessment results.', onRetry }) {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center"
      >
        <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something Went Wrong</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">{message}</p>
        <div className="flex items-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#2563EB]/20"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={() => navigate('/student/assessments')}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Assessments
          </button>
        </div>
      </motion.div>
    </div>
  )
}
