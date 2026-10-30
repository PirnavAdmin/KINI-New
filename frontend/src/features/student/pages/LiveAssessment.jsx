import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, AlertCircle, CheckCircle, HelpCircle, ChevronLeft,
  ChevronRight, Flag, Send, Maximize2, Minimize2,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import assessmentService from '@/services/assessmentService'
import { getApiErrorMessage } from '@shared/services/apiServices'

export default function LiveAssessment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const studentAssessmentId = location.state?.studentAssessmentId

  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(Boolean(studentAssessmentId))
  const [loadError, setLoadError] = useState(
    studentAssessmentId ? '' : 'This assessment attempt was not started correctly.'
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  // answers: { [questionId]: selectedOptionId } — matches StudentAnswerDto
  // exactly (a single real AssessmentOption.optionId per question, never an
  // array index and never free text — the backend contract has no field
  // for either of those).
  const [answers, setAnswers] = useState({})
  const [markedForReview, setMarkedForReview] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle')
  const timerRef = useRef(null)
  const containerRef = useRef(null)
  const submittedRef = useRef(false)

  useEffect(() => {
    let mounted = true
    if (!studentAssessmentId) return undefined
    assessmentService.getAttempt(studentAssessmentId)
      .then((attempt) => {
        if (!mounted) return
        setAssessment(attempt)
        setTimeLeft(Math.max(0, Number(attempt.durationMinutes ?? location.state?.assessment?.duration ?? 0)) * 60)
      })
      .catch((error) => {
        if (!mounted) return
        setLoadError(getApiErrorMessage(error, 'Unable to load this assessment.'))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentAssessmentId])

  const questions = assessment?.questions || []
  const currentQ = questions[currentIndex]
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const markedCount = markedForReview.size
  const remainingQuestions = totalQuestions - answeredCount

  const formatTime = useCallback((seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}:${s.toString().padStart(2, '0')}`
  }, [])

  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
  const warning = timeLeft < 300 // Less than 5 minutes

  const handleAnswer = (questionId, optionId) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const toggleReview = (questionId) => {
    setMarkedForReview(prev => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !studentAssessmentId) return
    submittedRef.current = true
    clearInterval(timerRef.current)
    setSubmitting(true)
    try {
      const payload = {
        studentAssessmentId: Number(studentAssessmentId),
        answers: questions
          .filter((q) => answers[q.questionId] !== undefined && answers[q.questionId] !== null)
          .map((q) => ({
            questionId: Number(q.questionId),
            selectedOptionId: Number(answers[q.questionId]),
          })),
      }
      await assessmentService.submitAttempt(payload)
      // The backend confirmed the submission — navigate to the result page,
      // which loads the actual score via GET .../result/{id}. Nothing about
      // pass/fail or score is computed here.
      navigate(`/student/assessments/${id}/results`, {
        state: {
          studentAssessmentId,
          assessmentTitle: assessment?.title,
          totalQuestions,
          answeredCount,
          skippedCount: remainingQuestions,
          markedCount,
        },
        replace: true,
      })
    } catch (error) {
      submittedRef.current = false
      setSubmitting(false)
      toast.error(getApiErrorMessage(error, 'Unable to submit this assessment. Please try again.'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentAssessmentId, questions, answers, id, navigate])

  // Timer
  useEffect(() => {
    if (!assessment || !totalQuestions) return undefined
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [assessment, totalQuestions, handleSubmit])

  // Auto-save indicator (visual only — answers live in local state and are
  // sent to the backend in one batch on submit, matching submitAttempt's
  // request shape; there is no incremental-save endpoint in scope).
  useEffect(() => {
    const saveTimer = setInterval(() => {
      setAutoSaveStatus('saving')
      setTimeout(() => setAutoSaveStatus('saved'), 500)
      setTimeout(() => setAutoSaveStatus('idle'), 1500)
    }, 15000)
    return () => clearInterval(saveTimer)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setFullscreen(true)
    } else {
      await document.exitFullscreen()
      setFullscreen(false)
    }
  }

  useEffect(() => {
    const onFSChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFSChange)
    return () => document.removeEventListener('fullscreenchange', onFSChange)
  }, [])

  if (loading) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50 dark:bg-[#0B1121]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f55f7]" />
          <p className="text-sm font-medium text-slate-500">Loading your assessment...</p>
        </div>
      </div>
    )
  }

  if (loadError || !assessment) {
    return (
      <div className="grid h-screen place-items-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <div>
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Unable to load assessment</h1>
          <p className="mt-2 max-w-md text-sm text-slate-500">{loadError || 'Assessment not found.'}</p>
          <button type="button" onClick={() => navigate('/student/assessments')} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Back to Assessments</button>
        </div>
      </div>
    )
  }

  if (!totalQuestions) {
    return <div className="grid h-screen place-items-center bg-slate-50 p-6 text-center dark:bg-slate-950"><div><AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" /><h1 className="text-lg font-bold text-slate-900 dark:text-white">Questions are not published yet</h1><p className="mt-2 max-w-md text-sm text-slate-500">Your mentor has not published questions for this assessment. Please return after the assessment is ready.</p><button type="button" onClick={() => navigate('/student/assessments')} className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Back to Assessments</button></div></div>
  }

  const getQuestionStatus = (qId) => {
    if (markedForReview.has(qId)) return 'review'
    if (answers[qId] !== undefined && answers[qId] !== null) return 'answered'
    return 'unanswered'
  }

  const renderQuestion = () => {
    if (!currentQ) return null

    return (
      <motion.div
        key={currentQ.questionId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Question */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded-lg bg-[#0f55f7]/10 text-[#0f55f7]">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
              {currentQ.marks} mark{currentQ.marks === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.questionText}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option) => {
            const isSelected = answers[currentQ.questionId] === option.optionId

            return (
              <button
                key={option.optionId}
                onClick={() => handleAnswer(currentQ.questionId, option.optionId)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-[#0f55f7] bg-[#0f55f7]/5 shadow-sm shadow-[#0f55f7]/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#0f55f7] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {isSelected ? <CheckCircle className="h-3.5 w-3.5" /> : null}
                </div>
                <span className={`text-sm font-medium ${
                  isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {option.optionText}
                </span>
                {isSelected && (
                  <CheckCircle className="w-4 h-4 text-[#0f55f7] ml-auto shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} className="h-screen bg-slate-50 dark:bg-[#0B1121] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-700/50 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">{assessment.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
                />
              </div>
              <span className="text-[10px] font-medium text-slate-400">{answeredCount}/{totalQuestions}</span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold font-mono ${
              warning
                ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <Clock className={`w-4 h-4 ${warning ? 'text-red-500' : 'text-slate-400'}`} />
              {formatTime(timeLeft)}
            </div>

            {/* Auto-save indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
              {autoSaveStatus === 'saving' && <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />}
              {autoSaveStatus === 'saved' && <CheckCircle className="w-3 h-3 text-[#06b6a8]" />}
              <span className={`${autoSaveStatus === 'saved' ? 'text-[#06b6a8]' : 'text-slate-400'}`}>
                {autoSaveStatus === 'saving' ? 'Saving...' : autoSaveStatus === 'saved' ? 'Saved' : 'Auto-save'}
              </span>
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Toggle fullscreen">
              {fullscreen ? <Minimize2 className="w-4 h-4 text-slate-400" /> : <Maximize2 className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto">
            {renderQuestion()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous
                </button>
                <button
                  onClick={() => toggleReview(currentQ.questionId)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                    markedForReview.has(currentQ.questionId)
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${markedForReview.has(currentQ.questionId) ? 'fill-amber-500' : ''}`} />
                  Review
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentIndex(i => Math.min(totalQuestions - 1, i + 1))}
                  disabled={currentIndex === totalQuestions - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] rounded-xl hover:brightness-110 transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" /> Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="hidden lg:block w-64 bg-white dark:bg-slate-900/60 border-l border-slate-200 dark:border-slate-700/50 p-4 overflow-y-auto shrink-0">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Question Navigator</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q.questionId)
              return (
                <button
                  key={q.questionId}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                    idx === currentIndex
                      ? 'ring-2 ring-[#0f55f7] ring-offset-1 dark:ring-offset-slate-900'
                      : ''
                  } ${
                    status === 'answered' ? 'bg-emerald-500 text-white' :
                    status === 'review' ? 'bg-amber-400 text-white' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span>Marked for Review ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
              <span>Unanswered ({totalQuestions - answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#0f55f7]" />
              <span>Current</span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/30 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Answered</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{answeredCount}/{totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Marked</span>
              <span className="font-semibold text-amber-500">{markedCount}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Remaining</span>
              <span className="font-semibold text-rose-500">{remainingQuestions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => !submitting && setShowSubmitModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 p-6"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center mx-auto mb-3 border border-[#0f55f7]/10">
                  <Send className="w-6 h-6 text-[#0f55f7]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Assessment?</h3>
                <p className="text-sm text-slate-400 mt-1">Please review your progress before submitting</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Answered', value: answeredCount, icon: CheckCircle, color: 'emerald' },
                  { label: 'Skipped', value: remainingQuestions, icon: HelpCircle, color: 'slate' },
                  { label: 'Marked', value: markedCount, icon: Flag, color: 'amber' },
                  { label: 'Total', value: totalQuestions, icon: HelpCircle, color: 'blue' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
                    <p className={`text-xl font-bold text-${stat.color}-500`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue Assessment
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] rounded-xl hover:brightness-110 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
