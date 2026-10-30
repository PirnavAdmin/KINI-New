import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Clock, Shield, Monitor, Wifi, Globe, CheckCircle,
  AlertCircle, Camera, Mic, PlayCircle, ClipboardCheck,
  BookOpen, Loader2, HelpCircle, Target
} from 'lucide-react'
import toast from 'react-hot-toast'
import assessmentService, { normalizeAssessment } from '@/services/assessmentService'
import { getApiErrorMessage } from '@shared/services/apiServices'

export default function AssessmentInstructions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [agreed, setAgreed] = useState(false)
  const [starting, setStarting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [assessment, setAssessment] = useState(
    location.state?.assessment ? normalizeAssessment(location.state.assessment) : null
  )
  const [loading, setLoading] = useState(!location.state?.assessment)
  const { sectionId, sectionTitle, courseId, courseTitle, requiredScore, returnTo } = location.state || {}
  const effectivePassScore = sectionId ? (requiredScore || 80) : (assessment?.passingScore || 70)

  useEffect(() => {
    let mounted = true
    if (assessment || !id) return undefined

    // Metadata only, and only from the student-scoped endpoint — GET
    // /api/Assessment/{id} is the Mentor/Admin management endpoint and is
    // never called from a student screen. Questions (and their correct
    // answers) are never fetched here either; they're only loaded after a
    // real POST .../start call, once the student has actually committed to
    // attempting the assessment. This fallback only runs on a direct/refreshed
    // navigation with no location.state (the normal flow already has it).
    const loadAssessment = async () => {
      setLoading(true)
      try {
        const rows = await assessmentService.getAvailableAssessments()
        const match = (Array.isArray(rows) ? rows : []).find(
          (row) => String(row.assessmentId ?? row.id) === String(id)
        )
        if (mounted) setAssessment(match ? normalizeAssessment(match) : null)
      } catch (error) {
        if (mounted) setLoadError(getApiErrorMessage(error, 'Unable to load assessment instructions.'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAssessment()
    return () => {
      mounted = false
    }
  }, [assessment, id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-12 w-72 bg-slate-200 rounded-xl animate-pulse mb-6" />
        <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{loadError || 'Assessment not found'}</h2>
        <button onClick={() => {
          if (returnTo) navigate(returnTo)
          else navigate('/student/courses')
        }} className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#0f55f7] rounded-xl">
          Back to Course
        </button>
      </div>
    )
  }

  const handleStart = async () => {
    if (starting) return
    setStarting(true)
    try {
      const assessmentId = assessment.assessmentId ?? assessment.id
      // StartAssessmentDto = { assessmentId } only — the student is resolved
      // server-side from the JWT, never sent explicitly from the frontend.
      const attempt = await assessmentService.startAttempt({ assessmentId: Number(assessmentId) })
      const studentAssessmentId = attempt?.studentAssessmentId ?? attempt?.id
      if (!studentAssessmentId) throw new Error('The server did not return an assessment attempt ID.')
      navigate(`/student/assessments/${assessmentId}/live`, {
        state: { studentAssessmentId, assessment, sectionId, sectionTitle, courseId, courseTitle, requiredScore: effectivePassScore, returnTo },
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to start this assessment.'))
      setStarting(false)
    }
  }

  const systemChecks = [
    { icon: Monitor, label: 'Browser', value: 'Chrome 120+', status: 'pass' },
    { icon: Wifi, label: 'Internet', value: 'Connected', status: 'pass' },
    { icon: Globe, label: 'Bandwidth', value: 'Stable (45 Mbps)', status: 'pass' },
    { icon: Camera, label: 'Webcam', value: 'Available (optional)', status: 'info' },
    { icon: Mic, label: 'Microphone', value: 'Detected (optional)', status: 'info' },
  ]

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 to-white dark:from-[#0B1121] dark:to-[#0F172A]">
      <div className="mx-auto w-full max-w-none px-4 py-4 sm:px-6 lg:px-7">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (returnTo) navigate(returnTo)
            else navigate('/student/assessments', { state: { sectionId, courseId, returnTo } })
          }}
          className="group mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-[#0f55f7] dark:hover:text-blue-400"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Assessment
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0f55f7]/10 bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10">
            <BookOpen className="h-6 w-6 text-[#0f55f7]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{assessment.title}</h1>
            <p className="text-sm text-slate-400">Read the instructions carefully before starting</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Assessment Info Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-slate-900/60 dark:ring-white/[0.07] sm:grid-cols-4"
          >
            {[
              { icon: Clock, label: 'Duration', value: `${assessment.duration} min` },
              { icon: HelpCircle, label: 'Questions', value: assessment.totalQuestions ?? 'N/A' },
              { icon: Target, label: 'Pass Score', value: `${effectivePassScore}%` },
              { icon: Shield, label: 'Attempts Left', value: assessment.maxAttempts ? assessment.maxAttempts - (assessment.attempts || 0) : 'N/A' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                <item.icon className="h-4 w-4 shrink-0 text-[#0f55f7]" />
                <div>
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid items-start gap-4 lg:grid-cols-[0.82fr_1.18fr]">
          {/* System Check */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-slate-900/60 dark:ring-white/[0.07]"
          >
            <div className="mb-3 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[#06b6a8]" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">System Check</h2>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {systemChecks.map((check, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-900/[0.035] dark:bg-slate-800/50 dark:ring-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <check.icon className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{check.label}</p>
                      <p className="text-[10px] text-slate-400">{check.value}</p>
                    </div>
                  </div>
                  {check.status === 'pass' ? (
                    <CheckCircle className="w-4 h-4 text-[#06b6a8]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pre-Assessment Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-slate-900/60 dark:ring-white/[0.07]"
          >
            <div className="mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Pre-Assessment Checklist</h2>
            </div>
            <div className="grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
              {[
                { text: 'Read all instructions carefully before starting', important: true },
                { text: 'Timer starts once you begin - it cannot be paused', important: true },
                { text: 'Do not refresh or navigate away from the page' },
                { text: 'Questions are presented one at a time' },
                { text: 'Auto-save is enabled - your progress is saved automatically' },
                { text: 'Full-screen mode is recommended for best experience' },
                { text: 'You can mark questions for review and return to them later' },
                { text: 'Ensure you have a stable internet connection' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    item.important ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-slate-50 dark:bg-slate-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${item.important ? 'bg-amber-400' : 'bg-slate-300'}`} />
                  </div>
                  <span className={`text-xs leading-5 ${item.important ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          </div>

          {/* Agreement & Start */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.06] dark:bg-slate-900/60 dark:ring-white/[0.07] lg:flex-row lg:items-center lg:justify-between"
          >
            <label className="flex cursor-pointer items-start gap-3 lg:max-w-3xl">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0f55f7] focus:ring-[#0f55f7]/30 cursor-pointer"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                I have read and understood all the instructions. I am ready to begin the assessment.
              </span>
            </label>

            <button
              onClick={handleStart}
              disabled={!agreed || starting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-8 text-sm font-semibold text-white shadow-lg shadow-[#0f55f7]/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto lg:min-w-56"
            >
              {starting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Starting Assessment...</>
              ) : (
                <><PlayCircle className="w-5 h-5" /> Start Assessment</>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}


