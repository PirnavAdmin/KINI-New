import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp } from 'lucide-react'

const COLORS = ['#F59E0B', '#94A3B8', '#CD7F32']

export default function Leaderboard({ results, assessment }) {
  if (!results) return null

  const { rank = 1, totalParticipants = 100, score = 0 } = results
  const percentile = totalParticipants > 0 ? Math.round(((totalParticipants - rank + 1) / totalParticipants) * 100) : 100

  // Generate mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', score: Math.min(100, score + 8 + Math.floor(Math.random() * 5)) },
    { rank: 2, name: 'Maria Garcia', score: Math.min(100, score + 5 + Math.floor(Math.random() * 4)) },
    { rank: 3, name: 'James Wilson', score: Math.min(100, score + 3 + Math.floor(Math.random() * 3)) },
    { rank: rank, name: 'You', score, isYou: true },
    { rank: rank + 1, name: 'Sarah Lee', score: Math.max(0, score - 2 - Math.floor(Math.random() * 4)) },
    { rank: rank + 2, name: 'David Kim', score: Math.max(0, score - 5 - Math.floor(Math.random() * 5)) },
  ].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, displayRank: i + 1 }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
      className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <Trophy className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Leaderboard</h2>
          <p className="text-[11px] text-slate-400">Top {Math.min(10, totalParticipants)} of {totalParticipants} participants</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900 dark:text-white">#{rank}</p>
          <p className="text-[10px] text-emerald-500 flex items-center gap-0.5 justify-end">
            <TrendingUp className="w-3 h-3" /> Top {percentile}%
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {leaderboard.slice(0, 6).map((entry, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              entry.isYou
                ? 'bg-gradient-to-r from-[#2563EB]/10 to-[#7C3AED]/10 border border-[#2563EB]/20 dark:border-[#7C3AED]/20'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
            }`}
          >
            <span className={`w-6 text-center text-xs font-bold ${
              entry.displayRank <= 3 ? 'text-transparent bg-clip-text bg-gradient-to-r' : 'text-slate-400'
            }`}
              style={entry.displayRank <= 3 ? {
                backgroundImage: `linear-gradient(135deg, ${COLORS[entry.displayRank - 1]}, ${COLORS[entry.displayRank - 1]}88)`,
              } : {}}
            >
              {entry.displayRank <= 3 ? (
                <Medal className={`w-4 h-4 mx-auto`} style={{ color: COLORS[entry.displayRank - 1] }} />
              ) : `#${entry.displayRank}`}
            </span>
            <span className={`flex-1 text-xs font-medium truncate ${
              entry.isYou ? 'text-[#2563EB] dark:text-[#7C3AED] font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {entry.name} {entry.isYou && '(You)'}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">{entry.score}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
