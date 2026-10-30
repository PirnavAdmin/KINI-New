import { motion } from 'framer-motion'

export default function ScoreCircle({ score = 0, grade = 'A+', passed = true, size = 160 }) {
  const radius = (size / 2) - 12
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={passed ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Glow ring */}
        {passed && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(16, 185, 129, 0.3)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference * 0.3}
            strokeDashoffset={circumference * 0.7}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2, delay: 1.5, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
          className="text-3xl sm:text-4xl font-bold text-white leading-none"
        >
          {score}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-lg font-semibold text-white/80 mt-0.5"
        >
          {grade}
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
            passed ? 'bg-white/20 text-emerald-200' : 'bg-white/10 text-slate-300'
          }`}
        >
          {passed ? 'PASSED' : 'FAILED'}
        </motion.span>
      </div>
    </div>
  )
}
