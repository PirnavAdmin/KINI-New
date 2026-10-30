import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Eye,
  Flag,
  Loader2,
  RotateCcw,
  SkipForward,
  Trophy,
  XCircle,
} from 'lucide-react'
import KPI from '@/components/common/KPI'
import assessmentService from '@/services/assessmentService'
import { getApiErrorMessage } from '@shared/services/apiServices'

// Result stats use the global KPI card (same design in every portal).
const STAT_ACCENTS = { blue: 'blue', emerald: 'green', rose: 'red', amber: 'orange', purple: 'purple', slate: 'navy' }
function StatCard({ label, value, icon, tone = 'slate' }) {
  return <KPI label={label} value={value} icon={icon} accent={STAT_ACCENTS[tone] ?? 'navy'} />
}

export default function AssessmentResult() {
  const params = useParams()
  const assessmentId = params.assessmentId || params.id
  const location = useLocation()
  const navigate = useNavigate()
  const [showAnswers, setShowAnswers] = useState(false)
  const studentAssessmentId = location.state?.studentAssessmentId
  const [apiResult, setApiResult] = useState(null)
  const [loading, setLoading] = useState(Boolean(studentAssessmentId))
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true
    if (!studentAssessmentId) return undefined
    // GET /api/StudentAssessment/result/{id} — the backend's own scoring,
    // never computed client-side.
    assessmentService.getResult(studentAssessmentId)
      .then((data) => { if (mounted) setApiResult(data) })
      .catch((error) => { if (mounted) setLoadError(getApiErrorMessage(error, 'Unable to load your result.')) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [studentAssessmentId])

  const assessment = location.state?.assessment ?? null
  const result = apiResult
    ? {
        ...location.state,
        totalQuestions: location.state?.totalQuestions,
        score: apiResult.score,
        percentage: apiResult.percentage,
        passed: apiResult.result ? String(apiResult.result).toLowerCase().includes('pass') : undefined,
        // StudentAssessment.answers (nullable StudentAssessmentAnswer[]) —
        // present only if this backend deployment expands it on the result
        // response; the entity schema is the only reference available
        // (Swagger documents no response body for this endpoint), so this
        // is read defensively and never fabricated if absent.
        answers: Array.isArray(apiResult.answers) ? apiResult.answers : [],
      }
    : (!studentAssessmentId ? location.state : null)

  const totalQuestions = Number(result?.totalQuestions ?? 0)
  const correctAnswers = Number(result?.correctAnswers ?? result?.correct ?? result?.answers?.filter((a) => a.isCorrect)?.length ?? 0)
  const skippedCount = Number(result?.skippedCount ?? result?.skipped ?? 0)
  const wrongAnswers = Number(result?.wrongAnswers ?? result?.incorrect ?? Math.max(totalQuestions - correctAnswers - skippedCount, 0))
  const answeredCount = Number(result?.answeredCount ?? Math.max(totalQuestions - skippedCount, 0))
  const markedCount = Number(result?.markedCount ?? 0)
  const score = Number(result?.score ?? correctAnswers)
  const percentage = Number(result?.percentage ?? (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0))
  const passPercentage = Number(result?.passPercentage ?? 70)
  const passed = Boolean(result?.passed ?? percentage >= passPercentage)

  const answers = Array.isArray(result?.answers) ? result.answers : []

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-6rem)] place-items-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading your result...</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-white px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <XCircle className="mx-auto mb-4 h-10 w-10 text-rose-500" />
          <h1 className="text-xl font-bold text-slate-900">{loadError}</h1>
          <button
            onClick={() => navigate('/student/assessments')}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assessments
          </button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-white px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ClipboardList className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">No result data found</h1>
          <p className="mt-2 text-sm text-slate-500">No result data found. Please retake assessment.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/student/assessments')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assessments
            </button>
            <button
              onClick={() => navigate(`/student/assessments/${assessmentId}/instructions`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Assessment Result</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {assessment?.title || result.assessmentTitle || 'Assessment'}
              </h1>
              <p className="mt-2 text-sm text-slate-500">Assessment ID: {assessmentId}</p>
            </div>

            <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
              passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {passed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {passed ? 'Pass' : 'Fail'}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-6 text-center text-white">
              <Trophy className="mx-auto h-9 w-9 text-white/90" />
              <p className="mt-4 text-sm font-medium text-white/75">Percentage</p>
              <p className="mt-1 text-5xl font-black">{percentage}%</p>
              <p className="mt-3 text-sm text-white/80">Pass mark: {passPercentage}%</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatCard icon={Trophy} label="Score" value={`${score}/${totalQuestions}`} tone="blue" />
              <StatCard icon={CheckCircle2} label="Correct Answers" value={correctAnswers} tone="emerald" />
              <StatCard icon={XCircle} label="Wrong Answers" value={wrongAnswers} tone="rose" />
              <StatCard icon={SkipForward} label="Skipped" value={skippedCount} tone="slate" />
              <StatCard icon={ClipboardList} label="Answered" value={answeredCount} tone="purple" />
              <StatCard icon={Flag} label="Marked" value={markedCount} tone="amber" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate('/student/assessments')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assessments
          </button>
          <button
            onClick={() => navigate(`/student/assessments/${assessmentId}/instructions`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Assessment
          </button>
          <button
            onClick={() => setShowAnswers((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            <Eye className="h-4 w-4" />
            View Answers
          </button>
        </div>

        {showAnswers && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Answers</h2>
            <div className="mt-4 space-y-3">
              {answers.length === 0 && <p className="text-sm text-slate-500">Answer review is not available for this result.</p>}
              {answers.map((answer, index) => {
                const question = answer.question || {}
                const options = Array.isArray(question.options) ? question.options : []
                const selectedOption = options.find((o) => o.optionId === answer.selectedOptionId)
                const correctOption = options.find((o) => o.isCorrect)
                const isSkipped = answer.selectedOptionId === undefined || answer.selectedOptionId === null
                const status = isSkipped ? 'Skipped' : answer.isCorrect ? 'Correct' : 'Wrong'

                return (
                  <div key={answer.answerId ?? answer.questionId ?? index} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">Q{index + 1}. {question.questionText || 'Question text unavailable'}</p>
                      <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                        status === 'Correct' ? 'bg-emerald-100 text-emerald-700' :
                        status === 'Wrong' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Your answer:{' '}
                      <span className="font-semibold text-slate-700">
                        {isSkipped ? 'Skipped' : selectedOption?.optionText ?? answer.answerText ?? '—'}
                      </span>
                    </p>
                    {!answer.isCorrect && correctOption && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Correct answer:{' '}
                        <span className="font-semibold">{correctOption.optionText}</span>
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
