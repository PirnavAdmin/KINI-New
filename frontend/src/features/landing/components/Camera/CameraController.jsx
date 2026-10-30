import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useSceneStore from '../../store/sceneStore'
import useCameraPath from '../../hooks/useCameraPath'
import cameraPathKnots from './splinePath'

/**
 * CameraController — Drives the Three.js camera along a spline path
 * based on scroll progress.
 *
 * CRITICAL FIXES:
 * - Pre-allocates reusable THREE.Vector3 objects in refs to avoid 60fps GC churn
 * - Previous code created `new THREE.Vector3(...)` every frame inside useFrame,
 *   which caused frame-time spikes from garbage collection
 * - Mouse parallax uses pre-allocated offset object
 *
 * This component is placed inside the R3F Canvas and controls
 * the active camera directly.
 */
export default function CameraController() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const setCameraPosition = useSceneStore((s) => s.setCameraPosition)
  const setCameraLookAt = useSceneStore((s) => s.setCameraLookAt)
  const interactionMode = useSceneStore((s) => s.interactionMode)
  const mousePosition = useSceneStore((s) => s.mousePosition)

  const { camera } = useThree()

  // ── Pre-allocated reusable vectors (zero GC allocations in useFrame) ──
  const targetPos = useRef(new THREE.Vector3())
  const targetLook = useRef(new THREE.Vector3())
  const lerpPos = useRef(new THREE.Vector3())
  const lerpLook = useRef(new THREE.Vector3())
  const offset = useRef(new THREE.Vector3())

  const { getCameraState } = useCameraPath(cameraPathKnots)

  // Initialize camera and sync lerp targets to prevent initial judder
  useEffect(() => {
    camera.fov = 60
    camera.near = 0.1
    camera.far = 100
    camera.position.set(0, 0, 12)
    camera.updateProjectionMatrix()

    lerpPos.current.copy(camera.position)
    lerpLook.current.set(0, 0, 0)
  }, [camera])

  useFrame((state, delta) => {
    const target = getCameraState(cameraProgress)

    // Mouse parallax — write into pre-allocated vector
    const off = offset.current
    if (interactionMode === 'scroll') {
      off.set(
        (mousePosition[0] - 0.5) * 0.3,
        (mousePosition[1] - 0.5) * 0.15,
        0
      )
    } else {
      off.set(0, 0, 0)
    }

    // Write target into pre-allocated vectors (no new allocations)
    targetPos.current.copy(target.position).add(off)
    targetLook.current.copy(target.lookAt)

    // Smooth lerp with frame-rate-independent factor
    const lerpFactor = Math.min(1, delta * 3)
    lerpPos.current.lerp(targetPos.current, lerpFactor)
    lerpLook.current.lerp(targetLook.current, lerpFactor)

    // Apply to camera
    camera.position.copy(lerpPos.current)
    camera.lookAt(lerpLook.current)

    // Smooth FOV transition
    const fovDiff = target.fov - camera.fov
    if (Math.abs(fovDiff) > 0.01) {
      camera.fov += fovDiff * delta * 3
      camera.updateProjectionMatrix()
    }

    // Update store once per frame (for UI overlays)
    setCameraPosition([camera.position.x, camera.position.y, camera.position.z])
    setCameraLookAt([lerpLook.current.x, lerpLook.current.y, lerpLook.current.z])
  })

  return null
}
