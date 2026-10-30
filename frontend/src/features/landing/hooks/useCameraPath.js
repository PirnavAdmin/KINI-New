import { useMemo, useRef, useCallback } from 'react'
import * as THREE from 'three'

/**
 * useCameraPath — Takes an array of control points (knots) and provides
 * a function to get interpolated camera position + lookAt at a given
 * progress (0–1) along a CatmullRom spline.
 *
 * Each knot is: { position: [x, y, z], lookAt: [x, y, z], fov?: number }
 */
export default function useCameraPath(knots) {
  const splineRef = useRef(null)
  const lookAtSplineRef = useRef(null)

  // Build CatmullRom splines from the knot positions & lookAts
  const pathLength = useMemo(() => {
    if (!knots || knots.length < 2) return 0

    const points = knots.map((k) => new THREE.Vector3(...k.position))
    const lookAtPoints = knots.map((k) => new THREE.Vector3(...k.lookAt))

    const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
    const lookAtCurve = new THREE.CatmullRomCurve3(lookAtPoints, false, 'catmullrom', 0.5)

    splineRef.current = curve
    lookAtSplineRef.current = lookAtCurve

    return curve.getLength()
  }, [knots])

  /**
   * Get camera state at a given progress (0–1) along the path.
   * @param {number} t - Normalized progress (0–1)
   * @param {Object} [options]
   * @param {boolean} [options.smooth] - Use smooth easing
   * @returns {{ position: THREE.Vector3, lookAt: THREE.Vector3, fov: number }}
   */
  const getCameraState = useCallback(
    (t, options = {}) => {
      const clamped = Math.max(0, Math.min(1, t))
      const spline = splineRef.current
      const lookAtSpline = lookAtSplineRef.current

      if (!spline || !lookAtSpline) {
        return {
          position: new THREE.Vector3(0, 0, 8),
          lookAt: new THREE.Vector3(0, 0, 0),
          fov: 60,
        }
      }

      const position = spline.getPoint(clamped)
      const lookAt = lookAtSpline.getPoint(clamped)

      // Interpolate FOV if knots have fov values
      let fov = 60
      if (knots && knots.length > 1) {
        const totalSegments = knots.length - 1
        const segmentFloat = clamped * totalSegments
        const segIndex = Math.min(Math.floor(segmentFloat), totalSegments - 1)
        const segProgress = segmentFloat - segIndex

        const fovA = knots[segIndex].fov ?? 60
        const fovB = knots[segIndex + 1]?.fov ?? 60
        fov = fovA + (fovB - fovA) * segProgress
      }

      return { position, lookAt, fov }
    },
    [knots]
  )

  return {
    getCameraState,
    pathLength,
    totalKnots: knots?.length || 0,
  }
}
