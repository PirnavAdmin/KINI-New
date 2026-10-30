import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useSceneStore from '../../store/sceneStore'

/**
 * SceneManager — Manages scene-specific effects and properties.
 *
 * With the single-HolographicSphere architecture, this component
 * no longer conditionally renders scenes. Instead it adjusts
 * scene-wide parameters (bloom intensity, fog density, etc.)
 * based on the current camera progress.
 *
 * Kept as a lightweight orchestrator for future extensibility.
 */
export default function SceneManager() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const { scene } = useThree()
  const fogRef = useRef(null)

  // Adjust fog density based on scroll progress
  // Closer to sphere = less fog, further = more fog
  useEffect(() => {
    if (!scene) return

    // Dynamic fog: fades as camera approaches the sphere
    const fogDensity = 0.02 + Math.sin(cameraProgress * Math.PI) * 0.015
    if (scene.fog) {
      scene.fog.far = 20 - cameraProgress * 8
    }

    // Background color subtle shift
    const bgColor = new THREE.Color('#020617')
    bgColor.lerp(new THREE.Color('#0a0a2e'), Math.sin(cameraProgress * Math.PI) * 0.3)
    scene.background = bgColor

    return () => {}
  }, [cameraProgress, scene])

  return null
}
