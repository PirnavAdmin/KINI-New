import { motion } from 'framer-motion'
import { BarChart3, TrendingUp } from 'lucide-react'
import { getMasteryLevel } from '@shared/utils/gradeCalculator'

export default function TopicAnalysis({ topicData = [] }) {
  if (!topicData.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-[#2563EB]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Topic-wise Performance</h2>
          <p className="text-[11px] text-slate-400">Detailed breakdown by subject</p>
        </div>
      </div>

      <div className="space-y-4">
        {topicData.map((topic, i) => {
          const mastery = getMasteryLevel(topic.score)
          return (
            <motion.div
              key={topic.topic || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{topic.topic}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${mastery.color}15`,
                      color: mastery.color,
                    }}
                  >
                    {mastery.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{topic.score}%</span>
              </div>
              <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topic.score}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${mastery.color}, ${mastery.color}88)`,
                    boxShadow: `0 0 8px ${mastery.color}40`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">
                  {topic.correct ?? '-'} correct / {topic.wrong ?? '-'} wrong
                </span>
                <span className="text-[10px] text-slate-400">
                  Avg: {topic.avg ?? '-'}%
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
