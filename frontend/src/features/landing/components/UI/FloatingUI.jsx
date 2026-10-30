import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import useSceneStore from '../../store/sceneStore'

/**
 * FloatingUI — 2D overlay elements positioned relative to the
 * 3D camera view. Shows scroll progress, scene labels, and
 * interactive CTA buttons.
 *
 * These elements float in screen space with parallax effects
 * tied to mouse position.
 */
export default function FloatingUI() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const activeScene = useSceneStore((s) => s.activeScene)
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const mousePosition = useSceneStore((s) => s.mousePosition)

  const sceneLabels = [
    { title: 'Welcome to the Future', subtitle: 'Scroll to explore' },
    { title: 'Global Network', subtitle: 'Connected worldwide' },
    { title: 'Everything You Need', subtitle: 'Complete learning ecosystem' },
    { title: 'Begin Your Journey', subtitle: 'Join thousands of success stories' },
  ]

  // Mouse parallax offset
  const mouseX = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 })
  const mouseY = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 })

  useEffect(() => {
    mouseX.set((mousePosition[0] - 0.5) * 20)
    mouseY.set((mousePosition[1] - 0.5) * 20)
  }, [mousePosition])

  // Scene label visibility based on camera progress
  const currentLabelIndex = sceneLabels.length - 1 - Math.round((1 - cameraProgress) * (sceneLabels.length - 1))
  const clampedIndex = Math.max(0, Math.min(currentLabelIndex, sceneLabels.length - 1))

  return (
    <>
      {/* Top-left: Scene title */}
      <motion.div
        style={{ x: mouseX, y: mouseY }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-24 left-8 z-50 pointer-events-none"
      >
        <motion.p
          key={clampedIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-mono text-slate-400 tracking-[0.2em] uppercase"
        >
          {sceneLabels[clampedIndex].subtitle}
        </motion.p>
      </motion.div>

      {/* Bottom-center: Scroll indicator */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: cameraProgress > 0.05 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border border-slate-600/50 flex justify-center"
        >
          <motion.div
            animate={{ y: [4, 12, 4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-2 rounded-full bg-gradient-to-b from-[#6366f1] to-[#06b6d4] mt-1"
          />
        </motion.div>
        <span className="text-[10px] text-slate-600 font-mono tracking-[0.2em] uppercase">
          Scroll to explore
        </span>
      </motion.div>

      {/* Bottom-right: Progress */}
      <div className="fixed bottom-12 right-8 z-50 flex items-center gap-3">
        <div className="w-20 h-[1px] bg-white/10 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]"
            style={{ width: `${cameraProgress * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {Math.round(cameraProgress * 100)}%
        </span>
      </div>

      {/* Active scene indicator dots */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {sceneLabels.map((_, i) => (
          <motion.div
            key={i}
            className="w-[2px] h-6 rounded-full cursor-pointer"
            animate={{
              background: i === clampedIndex
                ? 'linear-gradient(to bottom, #6366f1, #06b6d4)'
                : 'rgba(148, 163, 184, 0.2)',
              scale: i === clampedIndex ? 1.5 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </>
  )
}
