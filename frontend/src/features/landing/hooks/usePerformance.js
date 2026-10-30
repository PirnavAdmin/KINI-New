import { useEffect } from 'react'
import useSceneStore, { PERFORMANCE_TIERS } from '../store/sceneStore'

/**
 * usePerformance — Detects device capabilities and sets the appropriate
 * performance tier. Also provides utils for adaptive quality rendering.
 */
export default function usePerformance() {
  const {
    performanceTier,
    particleCount,
    enablePostProcessing,
    enableShadows,
    pixelRatio,
    setPerformanceTier,
    detectPerformance,
  } = useSceneStore()

  useEffect(() => {
    detectPerformance()

    // Re-detect on resize (e.g., switching to mobile)
    const handleResize = () => {
      // Only down-shift, never upshift on resize to avoid jank
      const { screen, navigator } = window
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      if (isMobile && performanceTier === PERFORMANCE_TIERS.HIGH) {
        setPerformanceTier(PERFORMANCE_TIERS.MEDIUM)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /**
   * Returns simplified detail level for conditional rendering.
   * 0 = low, 1 = medium, 2 = high
   */
  const detailLevel =
    performanceTier === PERFORMANCE_TIERS.LOW
      ? 0
      : performanceTier === PERFORMANCE_TIERS.MEDIUM
        ? 1
        : 2

  return {
    performanceTier,
    particleCount,
    enablePostProcessing,
    enableShadows,
    pixelRatio,
    detailLevel,
    isLowPerformance: detailLevel <= 0,
    isMobile: detailLevel <= 1,
  }
}
