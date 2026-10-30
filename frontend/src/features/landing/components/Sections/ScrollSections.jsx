import { useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import useSceneStore from '../../store/sceneStore'
import GlassCard from '../MicroInteractions/GlassCard'

/**
 * ScrollSections — Feature cards that appear during scroll.
 *
 * Constraints from brief:
 * - Maximum 4 cards
 * - Height: 220px
 * - Radius: 32px
 * - Glass effect with low opacity borders, blur 16px
 * - Padding: 32px
 * - No clutter, no oversized cards
 * - Clean Apple-level hierarchy
 */

const FEATURES = [
  {
    title: 'AI-Powered Learning',
    desc: 'Adaptive algorithms create personalized learning paths that evolve with your progress.',
    icon: '🤖',
    gradient: 'from-[#6366f1] to-[#06b6d4]',
  },
  {
    title: '1:1 Mentorship',
    desc: 'Connect with industry experts for personalized guidance and career advice.',
    icon: '👨‍🏫',
    gradient: 'from-[#06b6d4] to-[#8b5cf6]',
  },
  {
    title: 'Live Projects',
    desc: 'Build real-world projects that showcase your skills to employers.',
    icon: '🚀',
    gradient: 'from-[#8b5cf6] to-[#ec4899]',
  },
  {
    title: 'Placement Ready',
    desc: '99% placement rate with 500+ partner companies hiring our graduates.',
    icon: '💼',
    gradient: 'from-[#f59e0b] to-[#22c55e]',
  },
]

const SECTION_RANGE = [0.18, 0.55] // visible during scene 1-3

export default function ScrollSections() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)

  const mid = (SECTION_RANGE[0] + SECTION_RANGE[1]) / 2
  const halfWidth = (SECTION_RANGE[1] - SECTION_RANGE[0]) / 2
  const dist = Math.abs(cameraProgress - mid)
  const sectionOpacity = Math.max(0, Math.min(1, 1 - dist / halfWidth))

  const sectionProgress = (cameraProgress - SECTION_RANGE[0]) / (SECTION_RANGE[1] - SECTION_RANGE[0])

  if (sectionOpacity <= 0) return null

  return (
    <div
      className="px-8 lg:px-0 pb-24"
      style={{ opacity: sectionOpacity }}
    >
      <div className="max-w-[600px]">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl font-semibold text-white mb-8 tracking-[-0.02em]"
        >
          Everything You Need
        </motion.h2>

        <div className="flex flex-col gap-4">
          {FEATURES.map((feature, i) => {
            const cardReveal = Math.max(0, Math.min(1, (sectionProgress - i * 0.08) * 3))
            return (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: cardReveal,
                  x: 30 * (1 - cardReveal),
                  y: 10 * (1 - cardReveal) * (i % 2 === 0 ? 1 : -1),
                  scale: 0.92 + cardReveal * 0.08,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 22,
                  mass: 0.4,
                }}
              >                  <GlassCard
                  className="flex items-start gap-5 h-[220px] rounded-[32px] p-8"
                  tiltFactor={4}
                  glowOnHover={true}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl">
                    {feature.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-white font-semibold text-base mb-2 tracking-[-0.01em]">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[380px]">
                      {feature.desc}
                    </p>
                  </div>
                  {/* Gradient accent line */}
                  <div className={`w-[3px] h-12 rounded-full bg-gradient-to-b ${feature.gradient} flex-shrink-0 mt-1`} />
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
