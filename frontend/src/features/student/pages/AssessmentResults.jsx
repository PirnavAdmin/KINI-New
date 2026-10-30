import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

import { useAssessmentResults } from '@shared/hooks/useAssessmentResults'
import AssessmentHeader from '@features/assessments/components/AssessmentHeader'
import SummaryCard from '@features/assessments/components/SummaryCard'
import TopicAnalysis from '@features/assessments/components/TopicAnalysis'
import QuestionAccordion from '@features/assessments/components/QuestionAccordion'
import FeedbackCard from '@features/assessments/components/FeedbackCard'
import Achievements from '@features/assessments/components/Achievements'
import Leaderboard from '@features/assessments/components/Leaderboard'
import CourseRecommendations from '@features/assessments/components/CourseRecommendations'
import BottomActions from '@features/assessments/components/BottomActions'
import LoadingSkeleton from '@features/assessments/components/LoadingSkeleton'
import EmptyState from '@features/assessments/components/EmptyState'
import ErrorState from '@features/assessments/components/ErrorState'

import {
  CheckCircle, XCircle, HelpCircle, Clock, Award,
  FileText, Target, TrendingUp, BarChart3,
} from 'lucide-react'

function ConfettiEffect() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.2 + Math.random() * 1.5,
    rotation: Math.random() * 720 - 360,
    color: ['#0f55f7', '#06b6a8', '#06b6a8', '#F59E0B', '#EF4444', '#EC4899', '#06b6a8', '#06b6a8'][Math.floor(Math.random() * 8)],
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? 'circle' : 'square',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: -20 }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', opacity: [1, 1, 0], rotate: p.rotation }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className={p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 6px ${p.color}40`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default function AssessmentResults() {
  const { id } = useParams()
  const location = useLocation()
  const [showConfetti, setShowConfetti] = useState(true)

  const {
    loading,
    error,
    assessment,
    results,
    stats,
    gradeInfo,
    timeInfo,
    topicData,
    pieData,
    strengths,
    weaknesses,
  } = useAssessmentResults(id, location.state)

  // ── Confetti auto-hide (must be BEFORE early returns to avoid hook count mismatch) ─
  useEffect(() => {
    if (results?.passed && showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [results?.passed, showConfetti])

  // ── Loading State ────────────────────────────────────────────
  if (loading) {
    return <LoadingSkeleton />
  }

  // ── Error State ──────────────────────────────────────────────
  if (error) {
    return (
      <ErrorState
        message={error.message || 'Unable to load assessment results.'}
        onRetry={() => window.location.reload()}
      />
    )
  }

  // ── No Results State ──────────────────────────────────────────
  if (!results) {
    return <EmptyState message="No results data available for this assessment." />
  }

  // ── Derived Data with Safe Fallbacks ──────────────────────────
  const {
    score = 0,
    correct = 0,
    incorrect = 0,
    skipped = 0,
    totalQuestions = 0,
    passed = false,
    timeTaken = 0,
    answers = [],
    rank = 0,
    totalParticipants = 0,
  } = results

  const accuracy = totalQuestions > 0
    ? Math.round(((correct + incorrect > 0 ? correct / (correct + incorrect) : 0)) * 100)
    : 0

  const totalMarks = totalQuestions
  const obtainedMarks = correct
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(timeTaken / totalQuestions) : 0
  const avgTimeDisplay = avgTimePerQuestion > 60
    ? `${Math.floor(avgTimePerQuestion / 60)}m ${avgTimePerQuestion % 60}s`
    : `${avgTimePerQuestion}s`

  const minutes = Math.floor(timeTaken / 60)
  const seconds = timeTaken % 60

  const summaryCards = [
    { icon: FileText, label: 'Total Questions', value: totalQuestions, color: '#0f55f7' },
    { icon: CheckCircle, label: 'Correct', value: correct, color: '#06b6a8', sublabel: `${totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0}% of total` },
    { icon: XCircle, label: 'Incorrect', value: incorrect, color: '#EF4444', sublabel: `${totalQuestions > 0 ? Math.round((incorrect / totalQuestions) * 100) : 0}% of total` },
    { icon: HelpCircle, label: 'Skipped', value: skipped, color: '#94A3B8' },
    { icon: Award, label: 'Obtained Marks', value: obtainedMarks, color: '#06b6a8', sublabel: `out of ${totalMarks}` },
    { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: '#F59E0B' },
    { icon: Clock, label: 'Time Taken', value: `${minutes}m ${seconds}s`, color: '#06b6a8' },
    { icon: TrendingUp, label: 'Avg Time/Q', value: avgTimeDisplay, color: '#EC4899' },
    { icon: BarChart3, label: 'Rank', value: rank > 0 ? `#${rank}` : '—', color: '#06b6a8', sublabel: rank > 0 ? `of ${totalParticipants}` : undefined },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Confetti Effect */}
      {showConfetti && passed && <ConfettiEffect />}

      {/* Assessment Header Hero */}
      <AssessmentHeader
        results={results}
        assessment={assessment}
        gradeInfo={gradeInfo}
        timeInfo={timeInfo}
      />

      {/* Summary Cards Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Performance Summary</h2>
            <p className="text-[11px] text-slate-400">Detailed breakdown of your results</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryCards.map((card, i) => (
            <SummaryCard key={i} {...card} delay={i * 0.03} />
          ))}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Topic Performance */}
        <TopicAnalysis topicData={topicData} />

        {/* Score Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-[#06b6a8]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Score Distribution</h2>
              <p className="text-[11px] text-slate-400">Breakdown of answers</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* Simple visual bar distribution instead of relying on recharts */}
            {pieData.length > 0 ? (
              <div className="w-full space-y-2">
                {pieData.map((d) => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-slate-600 dark:text-slate-400">{d.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{d.value}</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalQuestions > 0 ? (d.value / totalQuestions) * 100 : 0}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: d.color,
                          boxShadow: `0 0 6px ${d.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-8">No data available</p>
            )}

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
              {pieData.map((d) => (
                <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}: {d.value}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Strengths & Weaknesses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div className="bg-white dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl sm:rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#06b6a8]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.length > 0 ? strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-[#06b6a8] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">{item.topic}:</strong>{' '}
                  {item.description || `${item.score}% mastery`}
                </span>
              </li>
            )) : (
              <li className="text-xs text-slate-400">Complete more assessments to identify strengths.</li>
            )}
          </ul>
        </div>
        <div className="bg-white dark:bg-slate-900/60 border border-rose-100 dark:border-rose-900/30 rounded-2xl sm:rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Improvement Areas</h3>
          </div>
          <ul className="space-y-2">
            {weaknesses.length > 0 ? weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border border-rose-400 flex items-center justify-center mt-0.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                </div>
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">{item.topic}:</strong>{' '}
                  {item.description || `${item.score}% - needs review`}
                </span>
              </li>
            )) : (
              <li className="text-xs text-slate-400">Review your answers to identify areas for improvement.</li>
            )}
          </ul>
        </div>
      </motion.div>

      {/* AI Feedback */}
      <FeedbackCard assessment={assessment} results={results} />

      {/* Achievements + Leaderboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Achievements results={results} />
        <Leaderboard results={results} assessment={assessment} />
      </div>

      {/* Question Review */}
      <QuestionAccordion
        questions={assessment?.questions || []}
        answers={answers}
        results={results}
      />

      {/* Course Recommendations */}
      <CourseRecommendations assessment={assessment} />

      {/* Bottom Actions */}
      <BottomActions
        id={id}
        passed={passed}
        returnTo={results.returnTo}
        sectionId={results.sectionId}
        sectionTitle={results.sectionTitle}
        courseId={results.courseId}
        courseTitle={results.courseTitle}
        requiredScore={results.requiredScore || results.passPercentage}
      />
    </div>
  )
}


