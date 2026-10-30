import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * CursorLight — A spotlight that follows the mouse position in 3D space.
 *
 * Creates an interactive cursor light effect that illuminates the
 * holographic sphere as the user moves their mouse, adding depth
 * and responsiveness to the scene.
 *
 * Uses a pre-allocated stable Object3D target so the spotlight
 * always has a valid reference (fixes the broken inline-ternary pattern).
 * Pre-allocates all Vector3 objects to avoid GC pressure in useFrame.
 */
export default function CursorLight() {
  const lightRef = useRef(null)
  const { pointer, camera } = useThree()

  // Stable target that lives for the component's lifetime
  const lightTarget = useMemo(() => {
    const t = new THREE.Object3D()
    t.position.set(0, 0, 0)
    return t
  }, [])

  // Pre-allocated vectors
  const worldPos = useRef(new THREE.Vector3())
  const targetPos = useRef(new THREE.Vector3())
  const currentPos = useRef(new THREE.Vector3())

  useFrame((state, delta) => {
    if (!lightRef.current) return

    // Project mouse position into 3D space at z=4 (sphere distance)
    worldPos.current.set(pointer.x, pointer.y, 0.5)
    worldPos.current.unproject(camera)
    const dir = worldPos.current.sub(camera.position).normalize()
    const dist = -camera.position.z / dir.z
    targetPos.current.copy(camera.position).add(dir.multiplyScalar(dist))

    // Smooth follow with lerp
    const lerpFactor = Math.min(1, delta * 4)
    currentPos.current.lerp(targetPos.current, lerpFactor)

    lightRef.current.position.copy(currentPos.current)
  })

  return (
    <spotLight
      ref={lightRef}
      target={lightTarget}
      intensity={40}
      angle={0.4}
      penumbra={0.8}
      decay={1}
      distance={15}
      color="#6366f1"
    />
  )
}
