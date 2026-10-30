import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardCheck, Search, Filter, Clock, CheckCircle,
  AlertCircle, ArrowRight, Star, Zap
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import { createSectionAssessment } from '@features/student/pages/StudentCoursePlayer/utils/createSectionAssessment'

const STATUS_CONFIG = {
  pending: { label: 'Pending', class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', icon: Clock },
  completed: { label: 'Completed', class: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-[#06b6a8]/20', icon: CheckCircle },
}

const DEVOPS_ASSESSMENT = {
  ...createSectionAssessment({
    course: { id: 6, title: 'DevOps' },
    section: { id: 'linux-networking', title: 'Linux & Networking' },
  }),
  status: 'pending',
  attempts: 0,
  maxAttempts: 3,
}

export default function StudentAssessments() {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const loadAssessments = useCallback(() => {
    const recordingCompleted = localStorage.getItem('devops-recording-completed:6') === 'true'
    setLoading(true)
    setError('')
    setAssessments(recordingCompleted ? [DEVOPS_ASSESSMENT] : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAssessments()
  }, [loadAssessments])
  const getId = (asm) => asm?.id ?? asm?.assessmentId ?? asm?._id
  const getTitle = (asm) => asm?.title || asm?.name || asm?.assessmentName || '-'
  const getStatus = (asm) => asm?.status || (asm?.completed ? 'completed' : 'pending')
  const getCourse = (asm) => asm?.course || asm?.courseName || asm?.subject || '-'

  const handleAssessmentAction = (asm) => {
    const id = getId(asm)
    if (!id) return
    sessionStorage.setItem(`selectedAssessment:${id}`, JSON.stringify(asm))
    if (getStatus(asm) === 'pending') {
      navigate(`/student/assessments/${id}`)
    } else {
      navigate(`/student/assessments/${id}/review`)
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return assessments
    return assessments.filter(a => getStatus(a) === filter)
  }, [assessments, filter])

  const pending = assessments.filter(a => getStatus(a) === 'pending').length
  const completed = assessments.filter(a => getStatus(a) === 'completed').length

  return (
    <div className="w-full max-w-none px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6">
      <PageHeader
        title="Assessments"
        subtitle={`${pending} pending · ${completed} completed`}
        icon={ClipboardCheck}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: assessments.length, color: '#0f55f7' },
          { label: 'Pending', value: pending, color: '#F59E0B' },
          { label: 'Completed', value: completed, color: '#06b6a8' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold text-slate-900 dark:text-white" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-[#0f55f7] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))
        ) : error ? (
          <div className="text-center py-16 text-sm text-red-500">{error}</div>
        ) : filtered.map((asm, i) => {
          const status = getStatus(asm)
          const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
          const Icon = config?.icon || Clock
          return (
            <motion.div
              key={getId(asm) || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-emerald-50 dark:bg-emerald-500/10'
                }`}>
                  <Icon className={`w-5 h-5 ${status === 'pending' ? 'text-amber-500' : 'text-[#06b6a8]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{getTitle(asm)}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-lg border self-start ${config?.class}`}>
                      {config?.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{getCourse(asm)}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{asm.duration ?? '-'}</span>
                    <span>{asm.questions ?? asm.questionCount ?? 0} questions</span>
                    <span>Pass: {asm.passingScore ?? 0}%</span>
                    <span>Attempts: {asm.attempts ?? 0}/{asm.maxAttempts ?? 0}</span>
                    {asm.bestScore && <span className="text-[#06b6a8]">Best: {asm.bestScore}%</span>}
                  </div>
                </div>
                <button onClick={() => handleAssessmentAction(asm)} className="shrink-0 px-4 py-2 bg-[#0f55f7] text-white text-xs font-semibold rounded-xl hover:bg-[#0b3fc4] transition-colors">
                  {status === 'pending' ? 'Start' : 'Review'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No assessments found</p>
        </div>
      )}
    </div>
  )
}



