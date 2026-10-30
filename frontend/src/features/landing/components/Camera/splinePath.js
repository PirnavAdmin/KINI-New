/**
 * Camera Spline Path — Cinematic camera journey for the two-column layout.
 *
 * Matches the 5-scene structure from the refined brief:
 *   1. Opening:   (0,1.5,7) → slow dolly in, 3s, power4.out
 *   2. Scene 1:   (0,1.5,7) → (0,1,5), scroll synchronized
 *   3. Scene 2:   15° orbit, horizontal movement, small tilt
 *   4. Scene 3:   Top angle (0,4,4)
 *   5. Scene 4:   Close-up (0,0.5,3)
 *   6. Scene 5:   Return (0,1.5,7)
 *
 * Each knot: { position: [x,y,z], lookAt: [x,y,z], fov?: number }
 */
const cameraPathKnots = [
  // ═══════════════════════════════════════════════════════════
  // Scene 1: Opening — Slow cinematic dolly forward
  // Starts at (0,1.5,7), dollies in gently
  // ═══════════════════════════════════════════════════════════
  {
    position: [0, 1.5, 7],
    lookAt: [0, 0, 0],
    fov: 60,
  },
  {
    position: [0, 1.3, 6],
    lookAt: [0, 0.1, 0],
    fov: 56,
  },
  {
    position: [0, 1, 5],
    lookAt: [0, 0.2, 0],
    fov: 52,
  },

  // ── Transition: Gentle tilt right ──────────────────────────
  {
    position: [0.8, 1, 4.5],
    lookAt: [0, 0.2, 0],
    fov: 50,
  },

  // ═══════════════════════════════════════════════════════════
  // Scene 2: 15° orbit — horizontal movement, small tilt
  // Camera moves horizontally with parallax
  // ═══════════════════════════════════════════════════════════
  {
    position: [1.5, 0.8, 4],
    lookAt: [0, 0.1, 0],
    fov: 48,
  },
  {
    position: [2.0, 0.6, 3],
    lookAt: [0, 0, 0],
    fov: 45,
  },
  {
    position: [1.5, 0.8, 2],
    lookAt: [0, 0, 0],
    fov: 47,
  },
  {
    position: [0, 1, 2.5],
    lookAt: [0, 0.1, 0],
    fov: 50,
  },

  // ── Transition: Ascend ─────────────────────────────────────
  {
    position: [0, 2.5, 3.5],
    lookAt: [0, -0.1, 0],
    fov: 52,
  },

  // ═══════════════════════════════════════════════════════════
  // Scene 3: Top angle — Camera above looking down
  // Position: (0,4,4)
  // ═══════════════════════════════════════════════════════════
  {
    position: [0, 4, 4],
    lookAt: [0, 0, 0],
    fov: 55,
  },
  {
    position: [0.5, 4.2, 3.5],
    lookAt: [0, 0, 0],
    fov: 56,
  },
  {
    position: [-0.5, 3.8, 4.5],
    lookAt: [0, 0, 0],
    fov: 55,
  },
  {
    position: [0, 4, 4],
    lookAt: [0, 0, 0],
    fov: 55,
  },

  // ── Transition: Descend ────────────────────────────────────
  {
    position: [0, 2.5, 3.5],
    lookAt: [0, 0.2, 0],
    fov: 50,
  },

  // ═══════════════════════════════════════════════════════════
  // Scene 4: Close-up — Camera moves in close
  // Position: (0,0.5,3)
  // ═══════════════════════════════════════════════════════════
  {
    position: [0, 1, 3.5],
    lookAt: [0, 0.3, 0],
    fov: 45,
  },
  {
    position: [0, 0.5, 3],
    lookAt: [0, 0.4, 0],
    fov: 40,
  },

  // ── Transition: Pull back for reveal ───────────────────────
  {
    position: [0, 1, 4],
    lookAt: [0, 0.2, 0],
    fov: 48,
  },

  // ═══════════════════════════════════════════════════════════
  // Scene 5: Return — Camera returns to opening position
  // (0,1.5,7)
  // ═══════════════════════════════════════════════════════════
  {
    position: [0, 1.2, 5],
    lookAt: [0, 0.1, 0],
    fov: 52,
  },
  {
    position: [0, 1.5, 7],
    lookAt: [0, 0, 0],
    fov: 60,
  },
]

export default cameraPathKnots

/**
 * Scene boundary markers — maps scroll progress ranges to scenes.
 */
export const sceneBoundaries = [
  { sceneIndex: 0, start: 0.0, end: 0.18, knotStart: 0, knotEnd: 3 },
  { sceneIndex: 1, start: 0.18, end: 0.38, knotStart: 3, knotEnd: 9 },
  { sceneIndex: 2, start: 0.38, end: 0.58, knotStart: 9, knotEnd: 15 },
  { sceneIndex: 3, start: 0.58, end: 0.78, knotStart: 15, knotEnd: 19 },
  { sceneIndex: 4, start: 0.78, end: 1.0, knotStart: 19, knotEnd: 23 },
]
