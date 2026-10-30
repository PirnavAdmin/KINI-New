import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSceneStore from '../../store/sceneStore'

/**
 * LoadingScreen — Full-screen loading overlay with animated logo,
 * progress bar, and loading tip.
 *
 * Uses a local progress state that syncs to the store for external
 * visibility while allowing the component to manage its own display.
 */
export default function LoadingScreen() {
  const setLoading = useSceneStore((s) => s.setLoading)
  const setLoadProgress = useSceneStore((s) => s.setLoadProgress)
  const [show, setShow] = useState(true)
  const [localProgress, setLocalProgress] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    // Simulate loading progress
    let progress = 0
    intervalRef.current = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(intervalRef.current)
        setTimeout(() => {
          setLoading(false)
          setTimeout(() => setShow(false), 800)
        }, 500)
      }
      setLocalProgress(progress)
      setLoadProgress(progress)
    }, 200)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [setLoading, setLoadProgress])

  // Use local progress for smoother display
  const displayProgress = localProgress

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020617]"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center gap-4"
          >
            {/* Animated logo mark */}
            <div className="relative w-20 h-20">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{ opacity: 0.3 }}
              />
              <div className="absolute inset-2 rounded-full bg-[#020617] flex items-center justify-center">
                <span className="text-2xl font-black text-white">T</span>
              </div>
            </div>

            <motion.h1 className="text-2xl font-black text-white tracking-tight">
              KiniEdxHub
            </motion.h1>
          </motion.div>

          {/* Progress bar */}
          <div className="mt-12 w-48">
            <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4]"
                initial={{ width: '0%' }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 text-center font-mono">
              {Math.round(displayProgress)}%
            </p>
          </div>

          {/* Loading tip */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-xs text-slate-600"
          >
            Initializing experience...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
