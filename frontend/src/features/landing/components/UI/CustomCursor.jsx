import { useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import useCursorPosition from '../../hooks/useCursorPosition'

/**
 * CustomCursor — Premium cursor with:
 * - Glow ring that follows the mouse
 * - Expand effect on hoverable elements
 * - Smooth spring physics via Framer Motion
 * - Auto-hides on touch devices
 * - Respects prefers-reduced-motion
 */
export default function CustomCursor() {
  const { position, hoverTarget, isVisible } = useCursorPosition()
  const isTouchDevice = useRef(false)
  const prefersReducedMotion = useRef(false)

  // Spring-animated position values for smooth trailing
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const ringX = useMotionValue(-100)
  const ringY = useMotionValue(-100)

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const ringSpringConfig = { stiffness: 100, damping: 20, mass: 0.3 }

  const smoothCursorX = useSpring(cursorX, springConfig)
  const smoothCursorY = useSpring(cursorY, springConfig)
  const smoothRingX = useSpring(ringX, ringSpringConfig)
  const smoothRingY = useSpring(ringY, ringSpringConfig)

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => { prefersReducedMotion.current = e.matches }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (isTouchDevice.current) return
    cursorX.set(position.x - 8)
    cursorY.set(position.y - 8)
    ringX.set(position.x - 20)
    ringY.set(position.y - 20)
  }, [position.x, position.y])

  // Hide cursor when leaving the window
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      cursorX.set(-100)
      cursorY.set(-100)
      ringX.set(-100)
      ringY.set(-100)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [handleVisibilityChange])

  // Toggle cursor:none on <html> — only when the custom cursor is actually active
  useEffect(() => {
    if (isTouchDevice.current || prefersReducedMotion.current) return
    document.documentElement.classList.add('cursor-hidden')
    return () => document.documentElement.classList.remove('cursor-hidden')
  }, [])

  if (isTouchDevice.current || prefersReducedMotion.current) return null

  return (
    <>
      {/* Ring — outer glow circle */}
      <motion.div
        aria-hidden="true"
        style={{
          translateX: smoothRingX,
          translateY: smoothRingY,
          width: hoverTarget ? 64 : 40,
          height: hoverTarget ? 64 : 40,
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-[#2563EB]/40 bg-[#2563EB]/5 backdrop-blur-[2px] transition-[width,height] duration-300 ease-out mix-blend-screen"
      />

      {/* Dot — small inner dot */}
      <motion.div
        aria-hidden="true"
        style={{
          translateX: smoothCursorX,
          translateY: smoothCursorY,
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[9999] rounded-full bg-[#2563EB] shadow-[0_0_12px_rgba(37,99,235,0.6)] transition-opacity duration-200"
      />

      {/* Glow trail — subtle blur beneath */}
      <motion.div
        aria-hidden="true"
        style={{
          translateX: smoothRingX,
          translateY: smoothRingY,
          width: hoverTarget ? 80 : 56,
          height: hoverTarget ? 80 : 56,
          opacity: isVisible ? (hoverTarget ? 0.25 : 0.15) : 0,
        }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[9998] rounded-full bg-[#2563EB] blur-xl transition-all duration-300"
      />
    </>
  )
}
