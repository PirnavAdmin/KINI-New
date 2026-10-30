import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../store/sceneStore'

/**
 * SceneTransition — Full-screen HTML transition overlay.
 * Rendered outside the 3D canvas as a DOM layer for proper screen-space
 * transitions between scenes.
 *
 * Transition types:
 * - fade: Simple crossfade
 * - portal: Expanding spiral reveal
 */
export default function SceneTransition() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const transitionProgress = useSceneStore((s) => s.transitionProgress)
  const transitionType = useSceneStore((s) => s.transitionType)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isTransitioning) {
      setVisible(true)
    } else {
      const timeout = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isTransitioning])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9998] pointer-events-none"
          initial={{
            opacity: 0,
            scale: transitionType === 'portal' ? 0 : 1,
            rotate: 0,
          }}
          animate={{
            opacity: isTransitioning ? 0.8 : 0,
            scale: transitionType === 'portal' ? 2 : 1,
            rotate: transitionType === 'portal' ? 180 : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            background:
              transitionType === 'portal'
                ? 'conic-gradient(from 0deg, #6366f1, #06b6d4, #8b5cf6, #6366f1)'
                : 'radial-gradient(ellipse at center, #6366f1 0%, #0f172a 100%)',
            borderRadius: transitionType === 'portal' ? '50%' : '0%',
          }}
        />
      )}
    </AnimatePresence>
  )
}
