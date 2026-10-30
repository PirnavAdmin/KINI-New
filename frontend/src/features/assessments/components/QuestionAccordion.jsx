import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle, XCircle, HelpCircle, Clock, AlertCircle } from 'lucide-react'

function StatusBadge({ status }) {
  if (status === 'correct') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
        <CheckCircle className="w-3 h-3" /> Correct
      </span>
    )
  }
  if (status === 'wrong') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-[10px] font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
        <XCircle className="w-3 h-3" /> Wrong
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-500/10 text-[10px] font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20">
      <HelpCircle className="w-3 h-3" /> Skipped
    </span>
  )
}

function DifficultyBadge({ difficulty }) {
  const colors = {
    easy: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    medium: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    hard: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${colors[difficulty] || colors.medium}`}>
      {difficulty || 'medium'}
    </span>
  )
}

export default function QuestionAccordion({ questions = [], answers = [], results }) {
  const [expandedId, setExpandedId] = useState(null)

  // If no answers passed, generate from results
  const effectiveAnswers = answers?.length ? answers : (results?.answers || [])
  const effectiveQuestions = questions?.length ? questions : (results?.assessment?.questions || [])

  if (!effectiveQuestions.length) {
    return (
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No question data available for review.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-[#7C3AED]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Question Review</h2>
          <p className="text-[11px] text-slate-400">{effectiveQuestions.length} questions</p>
        </div>
      </div>

      <div className="space-y-2">
        {effectiveQuestions.map((q, i) => {
          const answer = effectiveAnswers.find(a => a.questionId === q.id)
          const isCorrect = answer?.isCorrect
          const isSkipped = !answer || answer.selectedOption === undefined || answer.selectedOption === null
          const status = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong'
          const isExpanded = expandedId === q.id

          return (
            <div key={q.id || i} className="border border-slate-100 dark:border-slate-700/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full flex items-center gap-3 p-3 sm:p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                aria-expanded={isExpanded}
                aria-label={`Question ${i + 1}: ${status}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-500/10' :
                  status === 'wrong' ? 'bg-rose-50 dark:bg-rose-500/10' :
                  'bg-slate-50 dark:bg-slate-500/10'
                }`}>
                  {status === 'correct' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> :
                   status === 'wrong' ? <XCircle className="w-3.5 h-3.5 text-rose-500" /> :
                   <HelpCircle className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Q{i + 1}</span>
                    <DifficultyBadge difficulty={q.difficulty} />
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{q.question}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {answer?.timeSpent && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {answer.timeSpent}s
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-slate-100 dark:border-slate-700/30">
                      <div className="pt-3 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                            <p className="text-[10px] font-medium text-slate-400 mb-1">Your Answer</p>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {isSkipped ? (
                                <span className="text-slate-400 italic">Skipped</span>
                              ) : (
                                q.options?.[answer?.selectedOption] ?? `Option ${answer?.selectedOption}`
                              )}
                            </p>
                          </div>
                          <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-3">
                            <p className="text-[10px] font-medium text-emerald-500 mb-1">Correct Answer</p>
                            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                              {Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.map(idx => q.options?.[idx]).join(', ')
                                : q.options?.[q.correctAnswer] ?? '—'}
                            </p>
                          </div>
                        </div>

                        {q.explanation && (
                          <div className="bg-blue-50/50 dark:bg-blue-500/5 rounded-xl p-3">
                            <p className="text-[10px] font-medium text-blue-500 mb-1">Explanation</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
