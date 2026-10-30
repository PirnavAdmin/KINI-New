import { motion } from 'framer-motion'
import { Sparkles, Lightbulb, Target, TrendingUp, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FeedbackCard({ assessment, results }) {
  const navigate = useNavigate()
  if (!results) return null

  const { score = 0, passed = false } = results

  const feedback = {
    overall: passed
      ? `Excellent work! You've demonstrated a strong understanding of ${assessment?.title || 'the subject'}. Your score of ${score}% indicates solid preparation and knowledge retention.`
      : `Good effort! Your score of ${score}% shows you have foundational knowledge. With some focused practice, you can improve significantly.`,
    suggestions: passed
      ? [
          'Review advanced topics to deepen your expertise',
          'Practice with real-world scenarios',
          'Explore supplementary learning resources',
        ]
      : [
          'Focus on the topics where you scored lowest',
          'Review core concepts and fundamental principles',
          'Take practice quizzes before retrying',
        ],
    improvement: passed
      ? 'Estimated improvement with recommended study: +8-12%'
      : 'Estimated improvement with recommended study: +15-20%',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Personalized AI Feedback</h2>
          <p className="text-[11px] text-slate-400">Based on your performance</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feedback.overall}</p>

        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Learning Suggestions</p>
            <ul className="space-y-1">
              {feedback.suggestions.map((s, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/50 dark:bg-slate-800/30 border border-indigo-100 dark:border-indigo-500/10">
          <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{feedback.improvement}</p>
        </div>

        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-500 shrink-0" />
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Recommended: <button onClick={() => navigate('/student/learning-paths')} className="underline font-medium hover:text-purple-700">View Learning Paths</button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
