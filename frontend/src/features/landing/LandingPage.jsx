import { useEffect, useRef, lazy, Suspense } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ThreeDCanvas from './components/ThreeD/ThreeDCanvas'
import HeroOverlay from './components/Sections/HeroOverlay'
import ScrollSections from './components/Sections/ScrollSections'
import StatsSection from './components/Sections/StatsSection'
import LoadingScreen from './components/UI/LoadingScreen'
import useSceneStore from './store/sceneStore'
import useScrollController from './hooks/useScrollController'
import ErrorBoundary from '../../shared/components/ErrorBoundary'

const Navbar = lazy(() => import('../../shared/components/Navbar'))

/**
 * LandingPage — Premium two-column 55/45 cinematic landing page.
 *
 * Layout (desktop):
 * ┌──────────────────────────────────────────┐
 * │             1440px max-width             │
 * │  ←80px→ ┌─55% content─┬─gap─┬─45% 3D─┐ │
 * │         │   Content   │72px │ Canvas │ │
 * │         │   scrolls   │     │ sticky │ │
 * │         └─────────────┴─────┴────────┘ │
 * └──────────────────────────────────────────┘
 *
 * Mobile: stacks vertically (content → canvas).
 * Inspiration: Apple Vision Pro, Stripe, Linear, Vercel
 *
 * Constraints enforced:
 * - Two-column 55/45 split, 1440px max-width
 * - 120px top padding, 80px sides, 72px gap
 * - No overlapping typography, max 2 headline lines
 * - No text inside 3D canvas
 * - 4 feature cards max
 */
export default function LandingPage() {
  const detectPerformance = useSceneStore((s) => s.detectPerformance)
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const setActiveScene = useSceneStore((s) => s.setActiveScene)
  const endTransition = useSceneStore((s) => s.endTransition)
  const setMousePosition = useSceneStore((s) => s.setMousePosition)
  const prevSceneRef = useRef(0)
  const isLoading = useSceneStore((s) => s.isLoading)

  // ── Refresh ScrollTrigger after LoadingScreen hides ─────────
  useEffect(() => {
    if (!isLoading) {
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [isLoading])

  // ── Scroll controller — maps scroll to camera progress ──────
  useScrollController({
    totalScrollDistance: 8000,
    enabled: true,
  })

  // ── Detect performance on mount ─────────────────────────────
  useEffect(() => {
    detectPerformance()
  }, [detectPerformance])

  // ── Scene boundaries ────────────────────────────────────────
  useEffect(() => {
    const boundaries = [
      { sceneIndex: 0, start: 0.0, end: 0.18 },
      { sceneIndex: 1, start: 0.18, end: 0.38 },
      { sceneIndex: 2, start: 0.38, end: 0.58 },
      { sceneIndex: 3, start: 0.58, end: 0.78 },
      { sceneIndex: 4, start: 0.78, end: 1.0 },
    ]

    let activeScene = 0
    for (const b of boundaries) {
      if (cameraProgress >= b.start && cameraProgress <= b.end) {
        activeScene = b.sceneIndex
        break
      }
    }

    if (activeScene !== prevSceneRef.current) {
      prevSceneRef.current = activeScene
      setActiveScene(activeScene)
      setTimeout(() => endTransition(), 1200)
    }
  }, [cameraProgress, setActiveScene, endTransition])

  // ── Mouse tracking ──────────────────────────────────────────
  useEffect(() => {
    const handleMove = (e) => {
      setMousePosition(
        (e.clientX / window.innerWidth) * 2,
        1 - e.clientY / window.innerHeight
      )
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [setMousePosition])

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-x-hidden">
      <LoadingScreen />

      {/* ── Navbar ────────────────────────────────────── */}
      <div className="relative z-30">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>

      {/* ── Two-Column Layout ─────────────────────────── */}
      <div className="relative max-w-[1440px] mx-auto px-8 lg:px-20">
        {/* 120px top padding shared by both columns, 80px sides on desktop */}
        <div className="flex flex-col lg:flex-row gap-0 lg:gap-[72px] min-h-screen pt-[120px]">
          {/* ── LEFT: Content column (55%) ────────────── */}
          <main className="w-full lg:w-[calc(55%-36px)] z-20 flex flex-col">
            {/* Hero section with scroll content */}
            <HeroOverlay />

            {/* Feature cards — appear during scroll */}
            <ScrollSections />

            {/* Stats counting animation — appears during mid-scroll */}
            <StatsSection />

            {/* Scroll spacers for camera progress */}
            {/* Total: 6 spacers × 100vh ≈ 6000px scroll distance */}
            <div className="pointer-events-none select-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: '100vh' }} />
              ))}
            </div>
          </main>

          {/* ── RIGHT: 3D Canvas (45%, sticky) ─────────── */}
          <aside className="w-full lg:w-[calc(45%-36px)] z-10">
            <ErrorBoundary>
              <ThreeDCanvas />
            </ErrorBoundary>
          </aside>
        </div>
      </div>
    </div>
  )
}
