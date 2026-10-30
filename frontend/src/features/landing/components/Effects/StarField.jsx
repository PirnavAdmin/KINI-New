import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * StarField — Simple static/moving star background for depth.
 * Uses InstancedMesh for performance.
 */
export default function StarField({ count = 3000, speed = 0.02 }) {
  const meshRef = useRef(null)

  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 80
      pos[i3 + 1] = (Math.random() - 0.5) * 80
      pos[i3 + 2] = (Math.random() - 0.5) * 80 - 20
      siz[i] = Math.random() * 2 + 0.5
    }
    return { positions: pos, sizes: siz }
  }, [count])

  useFrame((state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * speed * 0.1
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
