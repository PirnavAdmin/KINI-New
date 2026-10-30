import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../store/sceneStore'
import MagneticButton from '../MicroInteractions/MagneticButton'

/**
 * HeroOverlay — Left-column content for the two-column 55/45 layout.
 *
 * NOT an overlay anymore. Renders as a scrollable content column
 * alongside the 3D canvas. Content sections transition based on
 * scroll progress.
 *
 * Constraints:
 * - Maximum 2 headline lines
 * - 72px/56px/42px responsive sizing
 * - -0.03em tracking, 1.05 line-height, 800 weight
 * - Subheadline: 18px, opacity 0.75, max-width 600px, ≤3 lines
 * - No overlapping typography
 * - Apple-level whitespace and hierarchy
 */

const SECTIONS = [
  {
    id: 'hero',
    headline: ['Build the Future', 'with Intelligent Learning'],
    subtitle: 'An immersive 3D experience powered by cutting-edge adaptive technology.',
    cta: { primary: 'Get Started', secondary: 'Book Demo' },
  },
  {
    id: 'features',
    headline: ['AI-Powered Platform', 'for Modern Education'],
    subtitle: 'Adaptive learning paths, real-time mentorship, and intelligent assessments.',
    cta: { primary: 'Explore Features', secondary: 'Watch Video' },
  },
  {
    id: 'technology',
    headline: ['Next-Generation', 'Learning Technology'],
    subtitle: 'Built with React, Three.js, and real-time AI at its core.',
    cta: { primary: 'Learn More', secondary: 'View Tech Stack' },
  },
  {
    id: 'stats',
    headline: ['Trusted by', 'Industry Leaders'],
    subtitle: '99% placement rate. 500+ company partners. 4.9/5 student satisfaction.',
    cta: { primary: 'View Impact', secondary: 'Read Stories' },
  },
  {
    id: 'cta',
    headline: ['Ready to Launch', 'Your Future?'],
    subtitle: 'Begin your journey today and become part of tomorrow\'s workforce.',
    cta: { primary: 'Launch Experience', secondary: 'Talk to Advisor' },
  },
]

// ── Text reveal variants ─────────────────────────────────────
const headlineVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
}

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 0.75,
    y: 0,
    transition: { duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3 },
  },
}

const ctaVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3 },
  },
}

export default function HeroOverlay() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)

  const sectionIndex = useMemo(() => {
    const idx = Math.floor(cameraProgress * SECTIONS.length)
    return Math.min(idx, SECTIONS.length - 1)
  }, [cameraProgress])

  const currentSection = SECTIONS[sectionIndex]
  if (!currentSection) return null

  return (
    <div className="flex flex-col justify-center min-h-screen px-8 lg:px-0 pb-[120px]">
      <div className="max-w-[600px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={sectionIndex}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
              exit: {},
            }}
          >
            {/* Section label */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: -5 },
                visible: { opacity: 0.4, y: 0, transition: { duration: 0.4 } },
                exit: { opacity: 0, transition: { duration: 0.2 } },
              }}
              className="text-xs font-mono text-slate-400 tracking-[0.2em] uppercase mb-8"
            >
              {currentSection.id}
            </motion.p>

            {/* Headline — maximum 2 lines */}
            {currentSection.headline.map((line, i) => (
              <motion.h1
                key={i}
                variants={headlineVariants}
                className={`
                  text-[clamp(2.625rem,5.5vw,4.5rem)]
                  font-black leading-[1.05] tracking-[-0.03em]
                  ${i === 0
                    ? 'text-white'
                    : 'bg-gradient-to-r from-[#6366f1] via-[#818cf8] to-[#06b6d4] bg-clip-text text-transparent'
                  }
                  ${i === 0 ? 'mb-1' : 'mb-6'}
                `}
              >
                {line}
              </motion.h1>
            ))}

            {/* Subheadline — max 3 lines, 18px, opacity 0.75 */}
            <motion.p
              variants={subtitleVariants}
              className="text-lg text-slate-400 max-w-[600px] leading-relaxed"
            >
              {currentSection.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={ctaVariants}
              className="flex items-center gap-4 mt-10"
            >
              <MagneticButton variant="primary">
                {currentSection.cta.primary}
              </MagneticButton>
              <MagneticButton variant="secondary">
                {currentSection.cta.secondary}
              </MagneticButton>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: cameraProgress > 0.05 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mt-20"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-4 h-6 rounded-full border border-white/15 flex justify-center"
        >
          <motion.div
            animate={{ y: [3, 9, 3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[2px] h-2 rounded-full bg-gradient-to-b from-[#6366f1] to-[#06b6d4] mt-1"
          />
        </motion.div>
        <span className="text-[10px] text-slate-600 font-mono tracking-[0.2em] uppercase">
          Scroll
        </span>
      </motion.div>
    </div>
  )
}
