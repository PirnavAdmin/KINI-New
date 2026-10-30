import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import useSceneStore from '../../store/sceneStore'

/**
 * StatsSection — Spring-animated counting stat display.
 *
 * Animates from 0 → target value using framer-motion's
 * useMotionValue + useSpring for a smooth, organic count-up
 * effect triggered by scroll progress.
 *
 * Minimal, Apple-level design: large number, small label,
 * subtle gradient accent line — no glass cards, no clutter.
 */

const STAT_RANGE = [0.48, 0.72] // appears during stats section in scroll

const stats = [
  { value: 99, suffix: '%', label: 'Placement Rate', color: '#06b6d4' },
  { value: 500, suffix: '+', label: 'Company Partners', color: '#6366f1' },
  { value: 20, suffix: 'K+', label: 'Students Placed', color: '#8b5cf6' },
  { value: 49, suffix: '★', label: 'Student Rating', color: '#f59e0b', format: (v) => (v / 10).toFixed(1) },
]

export default function StatsSection() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)

  // Section visibility
  const mid = (STAT_RANGE[0] + STAT_RANGE[1]) / 2
  const halfWidth = (STAT_RANGE[1] - STAT_RANGE[0]) / 2
  const dist = Math.abs(cameraProgress - mid)
  const opacity = Math.max(0, Math.min(1, 1 - dist / halfWidth))
  const sectionProgress = (cameraProgress - STAT_RANGE[0]) / (STAT_RANGE[1] - STAT_RANGE[0])

  if (opacity <= 0) return null

  return (
    <div className="px-8 lg:px-0 pb-24" style={{ opacity }}>
      <div className="max-w-[600px]">
        <h2 className="text-xl font-semibold text-white mb-10 tracking-[-0.02em]">
          Our Impact
        </h2>

        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
          {stats.map((stat, i) => (
            <StatCounter
              key={i}
              stat={stat}
              index={i}
              sectionProgress={sectionProgress}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCounter({ stat, index, sectionProgress }) {
  const reveal = Math.max(0, Math.min(1, (sectionProgress - index * 0.06) * 5))
  const count = useMotionValue(0)
  const springCount = useSpring(count, {
    stiffness: 60,
    damping: 20,
    mass: 0.5,
  })
  const [display, setDisplay] = useState('0')

  // Stable formatter ref to prevent listener leaks
  const formatterRef = useRef((v) => {
    if (stat.format) return stat.format(v) + stat.suffix
    return Math.floor(v) + stat.suffix
  })

  // Update the motion value when scroll reveals the stat
  useEffect(() => {
    if (reveal > 0) {
      count.set(stat.value * reveal)
    } else {
      count.set(0)
    }
  }, [reveal, count, stat.value])

  // Listen for spring changes and update display
  useEffect(() => {
    const unsub = springCount.on('change', (v) => {
      setDisplay(formatterRef.current(v))
    })
    return unsub
  }, [springCount])

  return (
    <motion.div
      initial={false}
      animate={{
        opacity: reveal,
        y: 20 * (1 - reveal),
        scale: 0.9 + reveal * 0.1,
      }}
      transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 0.3 }}
    >
      {/* Number */}
      <div
        className="text-4xl md:text-5xl font-black mb-1 leading-none"
        style={{ color: stat.color }}
      >
        {display}
      </div>

      {/* Label */}
      <p className="text-sm text-slate-400 font-medium">{stat.label}</p>

      {/* Gradient accent line */}
      <div
        className="w-8 h-[2px] rounded-full mt-3"
        style={{
          background: `linear-gradient(90deg, ${stat.color}, transparent)`,
          opacity: reveal * 0.6,
        }}
      />
    </motion.div>
  )
}
