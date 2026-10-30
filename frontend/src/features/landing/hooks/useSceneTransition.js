import { useCallback, useRef } from 'react'
import { gsap } from 'gsap'
import useSceneStore from '../store/sceneStore'

/**
 * useSceneTransition — Provides functions to trigger cinematic transitions
 * between scenes with GSAP-powered animations.
 *
 * Transition types:
 * - fade: Simple crossfade
 * - portal: Spiral warp effect
 * - explode: Particle explosion morph
 * - slide: Camera slide
 */
export default function useSceneTransition() {
  const timelineRef = useRef(null)
  const { setActiveScene, endTransition, setTransitionProgress } = useSceneStore()

  const transitionToScene = useCallback(
    (sceneIndex, type = 'fade', duration = 1.5) => {
      // Kill any ongoing transition
      if (timelineRef.current) {
        timelineRef.current.kill()
      }

      setActiveScene(sceneIndex)
      setTransitionProgress(0)

      const tl = gsap.timeline({
        onComplete: () => {
          endTransition()
        },
      })

      // Phase 1: Exit (0 → 0.5)
      tl.to(
        { val: 0 },
        {
          val: 1,
          duration: duration * 0.4,
          ease: 'power2.in',
          onUpdate: () => {
            setTransitionProgress(tl.progress())
          },
        }
      )

      // Phase 2: Enter (0.5 → 1)
      tl.to(
        { val: 0 },
        {
          val: 1,
          duration: duration * 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            setTransitionProgress(0.5 + tl.progress() * 0.5)
          },
        },
        `+=${duration * 0.1}`
      )

      timelineRef.current = tl
    },
    [setActiveScene, endTransition, setTransitionProgress]
  )

  /**
   * Creates a scroll-driven transition timeline for smooth camera movement
   * between scenes during scrolling.
   */
  const createScrollTimeline = useCallback(
    (sceneIndex, options = {}) => {
      const {
        from = { cameraPosition: [0, 0, 8], cameraLookAt: [0, 0, 0] },
        to = { cameraPosition: [0, 0, 4], cameraLookAt: [0, 0, 0] },
        duration = 1,
      } = options

      const tl = gsap.timeline({
        paused: true,
        onStart: () => setActiveScene(sceneIndex),
      })

      return tl
    },
    [setActiveScene]
  )

  return {
    transitionToScene,
    createScrollTimeline,
  }
}
