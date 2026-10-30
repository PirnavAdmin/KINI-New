import { motion } from 'framer-motion'
import { Award, Zap, Star, Target, Trophy, Brain } from 'lucide-react'

const ACHIEVEMENTS = [
  { id: 'perfect', label: 'Perfect Score', icon: Star, desc: 'Score 100%', color: '#F59E0B', bgColor: '#F59E0B15' },
  { id: 'quick', label: 'Quick Learner', icon: Zap, desc: 'Finish in half the time', color: '#3B82F6', bgColor: '#3B82F615' },
  { id: 'consistent', label: 'Consistency', icon: Target, desc: 'Complete 5 assessments', color: '#10B981', bgColor: '#10B98115' },
  { id: 'top', label: 'Top Performer', icon: Trophy, desc: 'Score in top 10%', color: '#8B5CF6', bgColor: '#8B5CF615' },
  { id: 'expert', label: 'Expert', icon: Brain, desc: 'Master advanced topics', color: '#EC4899', bgColor: '#EC489915' },
]

export default function Achievements({ results }) {
  if (!results) return null

  const { score = 0, passed = false } = results
  const unlockedIds = []

  if (passed) unlockedIds.push('top')
  if (score >= 90) unlockedIds.push('expert')
  if (score >= 95) unlockedIds.push('perfect')
  if (score >= 80) unlockedIds.push('quick')
  if (score >= 70) unlockedIds.push('consistent')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <Award className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Achievements</h2>
          <p className="text-[11px] text-slate-400">{unlockedIds.length}/{ACHIEVEMENTS.length} unlocked</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {ACHIEVEMENTS.map((ach, i) => {
          const unlocked = unlockedIds.includes(ach.id)
          const Icon = ach.icon
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-300 ${
                unlocked
                  ? 'border cursor-default'
                  : 'opacity-40 grayscale'
              }`}
              style={{
                borderColor: unlocked ? `${ach.color}30` : 'transparent',
                backgroundColor: unlocked ? `${ach.bgColor}` : 'transparent',
              }}
              title={ach.desc}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
                style={{ backgroundColor: unlocked ? `${ach.color}15` : 'transparent' }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: unlocked ? ach.color : '#94A3B8' }} />
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${unlocked ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                {ach.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
