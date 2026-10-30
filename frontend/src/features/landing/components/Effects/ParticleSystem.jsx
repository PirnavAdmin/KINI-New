import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import usePerformance from '../../hooks/usePerformance'

/**
 * ParticleSystem — GPU-powered particle system with adaptive count.
 *
 * CRITICAL FIXES:
 * - Removed dead `targetPositions` reference that caused ReferenceError → context loss
 * - Color is compared by hex string, not object reference, to prevent useMemo recomputation
 * - useFrame avoids allocating new objects — pre-allocated Vector3
 * - Geometry is disposed on unmount to prevent GPU memory leak
 * - Particle count is clamped to safe maximum
 *
 * @param {Object} options
 * @param {'sphere'|'cube'|'scatter'|'galaxy'|'helix'} options.shape - Particle formation
 * @param {number} options.count - Particle count (capped at 30000)
 * @param {string|number} options.color - Color as hex number or string
 * @param {number} options.size - Particle size
 * @param {boolean} options.mouseReactive - Whether particles follow mouse
 * @param {number} options.speed - Animation speed multiplier
 * @param {number} options.opacity - Particle opacity
 */
export default function ParticleSystem({
  shape = 'galaxy',
  count: customCount,
  color = 0x2563eb,
  size: customSize,
  mouseReactive = true,
  speed = 0.5,
  opacity = 0.8,
}) {
  const { detailLevel } = usePerformance()
  const { pointer } = useThree()

  // Clamp max particle count to prevent GPU exhaustion
  const MAX_SAFE_PARTICLES = 30000
  const count = Math.min(customCount || (detailLevel >= 2 ? 30000 : detailLevel >= 1 ? 10000 : 3000), MAX_SAFE_PARTICLES)
  const particleSize = customSize || (detailLevel >= 2 ? 0.05 : 0.08)

  const pointsRef = useRef(null)
  const timeRef = useRef(0)

  // Stable color reference — normalize to hex number for useMemo comparison
  const colorHex = useMemo(() => {
    if (typeof color === 'number') return color
    return new THREE.Color(color).getHex()
  }, [color])

  // ── Generate initial positions — memoized by shape + count + colorHex ──
  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const siz = new Float32Array(count)

    const colorObj = new THREE.Color(colorHex)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      let x, y, z

      switch (shape) {
        case 'sphere': {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const r = 3 + Math.random() * 1.5
          x = r * Math.sin(phi) * Math.cos(theta)
          y = r * Math.sin(phi) * Math.sin(theta)
          z = r * Math.cos(phi)
          break
        }
        case 'galaxy': {
          const radius = Math.pow(Math.random(), 1.5) * 8
          const angle = Math.random() * Math.PI * 2
          const armOffset = Math.random() * 0.5 - 0.25
          const spread = (1 - radius / 8) * 1.5
          x = Math.cos(angle + radius * 0.5 + armOffset) * radius + (Math.random() - 0.5) * spread
          y = (Math.random() - 0.5) * (1 - radius / 8) * 3
          z = Math.sin(angle + radius * 0.5 + armOffset) * radius + (Math.random() - 0.5) * spread
          break
        }
        case 'helix': {
          const t = Math.random() * Math.PI * 6
          const r = 2 + Math.random() * 0.5
          x = Math.cos(t * 2) * r
          y = (t / (Math.PI * 6) - 0.5) * 8
          z = Math.sin(t * 2) * r
          break
        }
        case 'cube':
        default: {
          x = (Math.random() - 0.5) * 6
          y = (Math.random() - 0.5) * 6
          z = (Math.random() - 0.5) * 6
          break
        }
      }

      pos[i3] = x
      pos[i3 + 1] = y
      pos[i3 + 2] = z

      const brightVar = 0.6 + Math.random() * 0.4
      const c = colorObj.clone().multiplyScalar(brightVar)
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b

      siz[i] = Math.random() * 0.5 + 0.5
    }

    return { positions: pos, colors: col, sizes: siz }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, shape, colorHex])

  // Dispose BufferGeometry on unmount to prevent GPU memory leak
  useEffect(() => {
    const ref = pointsRef.current
    return () => {
      if (ref) {
        ref.geometry.dispose()
        if (ref.material) ref.material.dispose()
      }
    }
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    timeRef.current += delta * speed

    const geometry = pointsRef.current.geometry
    const positionsAttr = geometry.attributes.position
    const posArray = positionsAttr.array
    const time = state.clock.elapsedTime * speed

    // Frame-rate-independent float amplitude
    const floatAmp = 0.02 * delta * 30

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      posArray[i3] += Math.sin(time + i * 0.01) * floatAmp
      posArray[i3 + 1] += Math.cos(time * 0.7 + i * 0.015) * floatAmp
      posArray[i3 + 2] += Math.sin(time * 1.3 + i * 0.012) * floatAmp

      // Mouse reactivity — skip distance check for distant particles
      if (mouseReactive) {
        const dx = posArray[i3] - (pointer.x * 4)
        const dy = posArray[i3 + 1] - (-pointer.y * 3)
        const distSq = dx * dx + dy * dy
        if (distSq < 0.25 && distSq > 0.0001) {
          const dist = Math.sqrt(distSq)
          const force = (0.5 - dist) * 0.05 * delta * 30
          posArray[i3] += (dx / dist) * force
          posArray[i3 + 1] += (dy / dist) * force
        }
      }
    }

    positionsAttr.needsUpdate = true

    // Rotate the entire system slowly
    pointsRef.current.rotation.y = time * 0.03
    pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
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
        size={particleSize}
        vertexColors
        transparent
        opacity={opacity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
