import { motion } from 'framer-motion'
import {
  ArrowLeft, RotateCcw, Download, Share2, Award,
  BookOpen, BarChart3, LayoutDashboard,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BottomActions({ id, passed, returnTo, sectionId, sectionTitle, courseId, courseTitle, requiredScore }) {
  const navigate = useNavigate()

  const actions = [
    {
      label: returnTo ? 'Back to Course' : 'Back to Assessments',
      icon: ArrowLeft,
      onClick: () => {
        if (returnTo) {
          navigate(returnTo, {
            state: {
              sectionAssessmentPassed: passed,
              sectionId,
            },
          })
          return
        }
        navigate('/student/assessments')
      },
      variant: 'primary',
    },
    {
      label: 'Retake Assessment',
      icon: RotateCcw,
      onClick: () => navigate(`/student/assessments/${id}/instructions`, {
        state: { sectionId, sectionTitle, courseId, courseTitle, requiredScore, returnTo },
      }),
      variant: 'secondary',
    },
    {
      label: 'Download Report',
      icon: Download,
      onClick: () => {},
      variant: 'secondary',
    },
    {
      label: 'Share Results',
      icon: Share2,
      onClick: () => {},
      variant: 'secondary',
    },
    ...(passed ? [{
      label: 'View Certificate',
      icon: Award,
      onClick: () => navigate(`/student/assessments/${id}/certificate`),
      variant: 'accent',
    }] : []),
    {
      label: 'View Analytics',
      icon: BarChart3,
      onClick: () => navigate('/student/assessments/analytics'),
      variant: 'secondary',
    },
    {
      label: 'Go to Dashboard',
      icon: LayoutDashboard,
      onClick: () => navigate('/student/dashboard'),
      variant: 'ghost',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="flex flex-wrap items-center gap-2 sm:gap-3"
    >
      {actions.map((action, i) => {
        const Icon = action.icon
        const baseClasses = 'inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-[0.97]'

        if (action.variant === 'primary') {
          return (
            <button
              key={i}
              onClick={action.onClick}
              className={`${baseClasses} text-white bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:brightness-110 shadow-lg shadow-[#2563EB]/20`}
            >
              <Icon className="w-4 h-4" /> {action.label}
            </button>
          )
        }

        if (action.variant === 'accent') {
          return (
            <button
              key={i}
              onClick={action.onClick}
              className={`${baseClasses} text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20`}
            >
              <Icon className="w-4 h-4" /> {action.label}
            </button>
          )
        }

        if (action.variant === 'ghost') {
          return (
            <button
              key={i}
              onClick={action.onClick}
              className={`${baseClasses} text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30`}
            >
              <Icon className="w-4 h-4" /> {action.label}
            </button>
          )
        }

        return (
          <button
            key={i}
            onClick={action.onClick}
            className={`${baseClasses} text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50`}
          >
            <Icon className="w-4 h-4" /> {action.label}
          </button>
        )
      })}
    </motion.div>
  )
}
