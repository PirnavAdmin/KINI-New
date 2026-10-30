import { create } from 'zustand'

/**
 * Scene Store — Central state manager for the 3D cinematic landing page.
 *
 * Manages:
 * - Active scene index and transition state
 * - Camera target positions and look-at targets
 * - Progress along the scroll journey (0–1)
 * - Loading state and performance tier
 * - Interaction mode (orbit, scroll, inspect)
 */

export const SCENES = [
  { id: 'opening', label: 'Opening Scene', duration: 1.0 },
  { id: 'orbit', label: 'Orbit View', duration: 1.0 },
  { id: 'zoom', label: 'Zoom In', duration: 1.0 },
  { id: 'top-down', label: 'Top Down', duration: 0.8 },
  { id: 'reveal', label: 'Final Reveal', duration: 0.8 },
]

export const PERFORMANCE_TIERS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

const useSceneStore = create((set, get) => ({
  // ── Scene state ──────────────────────────────────────────────
  activeScene: 0,
  previousScene: null,
  isTransitioning: false,
  transitionProgress: 0,
  transitionType: 'fade', // 'fade' | 'portal' | 'explode' | 'particle-morph'

  // ── Camera ───────────────────────────────────────────────────
  cameraProgress: 0, // 0–1 across the entire journey
  cameraPosition: [0, 0, 8],
  cameraLookAt: [0, 0, 0],
  cameraFov: 60,
  isCameraAnimating: false,

  // ── Performance ──────────────────────────────────────────────
  performanceTier: PERFORMANCE_TIERS.HIGH,
  particleCount: 50000,
  enablePostProcessing: true,
  enableShadows: true,
  pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2,

  // ── Interaction ──────────────────────────────────────────────
  interactionMode: 'scroll', // 'scroll' | 'orbit' | 'inspect'
  mousePosition: [0, 0],
  isMouseDown: false,

  // ── Animation progress ───────────────────────────────────────
  animationProgress: 0,

  // ── Loading ──────────────────────────────────────────────────
  isLoading: true,
  loadProgress: 0,
  assetsLoaded: false,

  // ── Actions ──────────────────────────────────────────────────
  setActiveScene: (index) =>
    set({
      previousScene: get().activeScene,
      activeScene: index,
      isTransitioning: true,
      transitionProgress: 0,
    }),

  setTransitionProgress: (progress) =>
    set({ transitionProgress: progress }),

  endTransition: () =>
    set({ isTransitioning: false, transitionProgress: 1 }),

  setCameraProgress: (progress) =>
    set({ cameraProgress: progress }),

  setCameraPosition: (position) =>
    set({ cameraPosition: position }),

  setCameraLookAt: (lookAt) =>
    set({ cameraLookAt: lookAt }),

  setCameraAnimating: (isAnimating) =>
    set({ isCameraAnimating: isAnimating }),

  setPerformanceTier: (tier) => {
    const settings = {
      [PERFORMANCE_TIERS.LOW]: {
        particleCount: 5000,
        enablePostProcessing: false,
        enableShadows: false,
        pixelRatio: 1,
      },
      [PERFORMANCE_TIERS.MEDIUM]: {
        particleCount: 15000,
        enablePostProcessing: true,
        enableShadows: true,
        pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 1.5),
      },
      [PERFORMANCE_TIERS.HIGH]: {
        particleCount: 50000,
        enablePostProcessing: true,
        enableShadows: true,
        pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 2, 2),
      },
    }
    set({ performanceTier: tier, ...settings[tier] })
  },

  detectPerformance: () => {
    if (typeof window === 'undefined') return
    const { screen, navigator } = window
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4
    const isLowEnd = isMobile || isLowMemory

    if (isLowEnd) {
      get().setPerformanceTier(PERFORMANCE_TIERS.LOW)
    } else if (screen.width < 1024) {
      get().setPerformanceTier(PERFORMANCE_TIERS.MEDIUM)
    } else {
      get().setPerformanceTier(PERFORMANCE_TIERS.HIGH)
    }
  },

  setMousePosition: (x, y) =>
    set({ mousePosition: [x, y] }),

  setInteractionMode: (mode) =>
    set({ interactionMode: mode }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setLoadProgress: (progress) =>
    set({ loadProgress: progress }),

  setAssetsLoaded: (loaded) =>
    set({ assetsLoaded: loaded }),

  setAnimationProgress: (progress) =>
    set({ animationProgress: progress }),
}))

export default useSceneStore
