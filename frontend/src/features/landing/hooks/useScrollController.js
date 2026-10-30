import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import useSceneStore from '../store/sceneStore'

gsap.registerPlugin(ScrollTrigger)

/**
 * useScrollController — Manages Lenis smooth scroll and maps
 * scroll progress to camera movement through the 3D world.
 *
 * @param {Object} options
 * @param {number} options.totalScrollDistance - Total scroll distance in px
 * @param {boolean} options.enabled - Whether scroll control is active
 * @returns {{ lenis: Lenis | null, scrollProgress: number }}
 */
export default function useScrollController({
  totalScrollDistance = 6000,
  enabled = true,
} = {}) {
  const lenisRef = useRef(null)
  const scrollProgressRef = useRef(0)
  const setCameraProgress = useSceneStore((s) => s.setCameraProgress)
  const cameraProgress = useSceneStore((s) => s.cameraProgress)

  useEffect(() => {
    if (!enabled) return

    // ── Initialize Lenis ──────────────────────────────────────
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis

    // ── Connect GSAP ScrollTrigger to Lenis ───────────────────
    lenis.on('scroll', ScrollTrigger.update)

    // Add Lenis's RAF loop to GSAP's ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    // ── Create ScrollTrigger-driven camera progress ──────────
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: `+=${totalScrollDistance}`,
      scrub: 1.5,
      onUpdate: (self) => {
        const progress = self.progress
        scrollProgressRef.current = progress
        setCameraProgress(progress)
      },
    })

    return () => {
      trigger.kill()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled, totalScrollDistance])

  // ── Scroll to a specific progress (0–1) ─────────────────────
  const scrollToProgress = useCallback(
    (progress, options = {}) => {
      if (!lenisRef.current) return
      const target = progress * totalScrollDistance
      lenisRef.current.scrollTo(target, {
        duration: options.duration || 2,
        easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      })
    },
    [totalScrollDistance]
  )

  // ── Scroll to a specific element or pixel ───────────────────
  const scrollTo = useCallback(
    (target, options = {}) => {
      if (!lenisRef.current) return
      lenisRef.current.scrollTo(target, {
        duration: options.duration || 1.5,
        easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      })
    },
    []
  )

  return {
    lenis: lenisRef.current,
    scrollProgress: cameraProgress,
    scrollToProgress,
    scrollTo,
  }
}
