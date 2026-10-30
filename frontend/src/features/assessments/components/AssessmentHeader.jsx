import { motion } from 'framer-motion'
import { Award, XCircle, Sparkles, Clock, Trophy, CheckCircle, XCircle as XIcon, HelpCircle } from 'lucide-react'
import ScoreCircle from './ScoreCircle'

export default function AssessmentHeader({ results, assessment, gradeInfo, timeInfo }) {
  if (!results) return null

  const { score = 0, passed = false, correct = 0, incorrect = 0, skipped = 0, completedAt } = results
  const grade = gradeInfo?.grade || '—'
  const { minutes, seconds } = timeInfo || { minutes: 0, seconds: 0 }
  const date = completedAt ? new Date(completedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }) : new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 }}
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 ${
        passed
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700'
          : 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700'
      }`}
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/[0.03] rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Top meta */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              passed ? 'bg-emerald-400/20' : 'bg-slate-400/20'
            }`}>
              {passed ? (
                <Award className="w-6 h-6 text-emerald-200" />
              ) : (
                <XCircle className="w-6 h-6 text-slate-200" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {passed ? 'Congratulations!' : 'Assessment Complete'}
              </h1>
              <p className="text-sm text-white/70">{assessment?.title || results.assessmentTitle || 'Assessment'}</p>
              <p className="text-xs text-white/50 mt-0.5">Completed on {date}</p>
            </div>
          </div>
        </div>

        {/* Score section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <ScoreCircle score={score} grade={grade} passed={passed} />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-3">
              <span className={`text-lg sm:text-xl font-bold ${passed ? 'text-emerald-200' : 'text-slate-200'}`}>
                {passed ? 'Passed Successfully' : 'Needs Improvement'}
              </span>
              {passed && <Sparkles className="w-5 h-5 text-yellow-300" />}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-white/80 mb-4">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Grade: <strong className="text-white">{grade}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4" />
                Score: <strong className="text-white">{score}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Time: <strong className="text-white">{minutes}m {seconds}s</strong>
              </span>
            </div>

            {/* Score breakdown badges */}
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white/90">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                {correct} Correct
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white/90">
                <XIcon className="w-3.5 h-3.5 text-rose-300" />
                {incorrect} Incorrect
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white/90">
                <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                {skipped} Skipped
              </span>
              {passed && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-xs text-amber-200">
                  <Award className="w-3.5 h-3.5" />
                  Certificate Eligible
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
