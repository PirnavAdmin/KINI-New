import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import ParticleSystem from '../Effects/ParticleSystem'
import useSceneStore from '../../store/sceneStore'

/**
 * HolographicSphere — Futuristic centerpiece 3D object.
 *
 * CRITICAL: No Text components inside the 3D canvas.
 * The brief explicitly prohibits text in the 3D scene.
 * Typography lives in the HTML overlay (left column).
 *
 * Features:
 * - Glassmorphism transmission material (semi-transparent, refractive)
 * - Floating energy rings that rotate independently
 * - Orbiting icons (visual only, no text labels)
 * - Energy particles pulsing around the sphere
 * - Light trails (animated ring segments with emissive glow)
 * - Subtle breathing/rotating animation
 */

// ── Color palette ──────────────────────────────────────────────
const GLASS_COLOR = 0x6366f1
const GLASS_EMISSIVE = 0x818cf8
const RING_COLORS = [0x6366f1, 0x06b6d4, 0x8b5cf6, 0xec4899]
const TRAIL_COLOR = 0x06b6d4
const ICON_COLORS = [0x6366f1, 0x06b6d4, 0x8b5cf6, 0xf59e0b, 0x22c55e, 0xec4899]
const GLOW_COLOR = 0x818cf8

// ── Orbiting icon definitions (visual only, no text) ──────────
const ORBIT_ICONS = [
  { radius: 3.2, speed: 0.4, offset: 0, color: ICON_COLORS[0] },
  { radius: 3.8, speed: -0.3, offset: 1.2, color: ICON_COLORS[1] },
  { radius: 4.2, speed: 0.35, offset: 2.5, color: ICON_COLORS[2] },
  { radius: 3.5, speed: -0.45, offset: 0.8, color: ICON_COLORS[3] },
  { radius: 4.0, speed: 0.25, offset: 3.0, color: ICON_COLORS[4] },
  { radius: 3.0, speed: -0.5, offset: 1.8, color: ICON_COLORS[5] },
]

const TRAIL_SEGMENTS = 4

// ── Stable energy dot positions ───────────────────────────────
const ENERGY_DOTS = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * Math.PI * 2
  const ringIdx = i % 4
  const r = 2.0 + ringIdx * 0.35
  return {
    position: [Math.cos(angle) * r, Math.sin(angle * 2) * 0.3, Math.sin(angle) * r],
    ringIdx,
    opacityMultiplier: 0.3 + Math.sin(i) * 0.15,
  }
})

export default function HolographicSphere() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const groupRef = useRef(null)
  const sphereRef = useRef(null)
  const ringsRef = useRef(null)
  const glowRef = useRef(null)
  const orbitGroupRef = useRef(null)

  const opacity = Math.max(0.15, Math.min(1,
    1 - Math.abs(cameraProgress - 0.5) * 1.5
  ))

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    groupRef.current.rotation.y = time * 0.08
    const breathe = 1 + Math.sin(time * 0.5) * 0.015
    groupRef.current.scale.setScalar(breathe)

    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y = time * 0.15
    }

    if (sphereRef.current?.material) {
      const pulse = 0.3 + Math.sin(time * 0.8) * 0.15
      sphereRef.current.material.emissiveIntensity = pulse
    }

    if (glowRef.current?.material) {
      const glowPulse = 1 + Math.sin(time * 1.2) * 0.05
      glowRef.current.scale.setScalar(glowPulse)
      glowRef.current.material.opacity = opacity * (0.12 + Math.sin(time * 1.2) * 0.04)
    }
  })

  return (
    <group ref={groupRef} visible={opacity > 0.01}>
      <ParticleSystem
        shape="sphere"
        count={12000}
        color={GLASS_COLOR}
        speed={0.2}
        opacity={opacity * 0.35}
        size={0.04}
      />

      <group>
        {/* sphereRef must go on Sphere (a <mesh>), NOT on the <group>.
            THREE.Group has no `.material` property — trying to set
            `.material.emissiveIntensity` on a group would throw:
            "Cannot set properties of undefined (setting 'emissiveIntensity')"
            Sphere from drei forwards the ref to the underlying mesh. */}
        <Sphere ref={sphereRef} args={[1.6, 64, 64]}>
          <MeshTransmissionMaterial
            color={GLASS_COLOR}
            emissive={GLASS_EMISSIVE}
            emissiveIntensity={0.3}
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={opacity * 0.7}
            thickness={0.8}
            chromaticAberration={0.08}
            anisotropy={0.3}
            distortion={0.05}
            distortionScale={0.2}
            temporalDistortion={0.1}
            clearcoat={0.4}
            clearcoatRoughness={0.2}
            envMapIntensity={1.5}
            ior={1.5}
            side={THREE.DoubleSide}
          />
        </Sphere>
        <Sphere args={[0.8, 32, 32]}>
          <meshBasicMaterial
            color={GLOW_COLOR}
            transparent
            opacity={opacity * 0.15}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      </group>

      <group ref={ringsRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2.5 + i * 0.6, i * 0.8, 0]}>
            <torusGeometry args={[2.0 + i * 0.35, 0.008 + i * 0.004, 16, 80]} />
            <meshBasicMaterial
              color={RING_COLORS[i]}
              transparent
              opacity={opacity * (0.5 - i * 0.1)}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.2, 64]} />
        <meshBasicMaterial
          color={GLOW_COLOR}
          transparent
          opacity={opacity * 0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {Array.from({ length: TRAIL_SEGMENTS }).map((_, i) => (
        <LightTrail key={i} index={i} total={TRAIL_SEGMENTS} color={TRAIL_COLOR} opacity={opacity} />
      ))}

      <group ref={orbitGroupRef}>
        {ORBIT_ICONS.map((icon, i) => (
          <OrbitingIcon
            key={i}
            radius={icon.radius}
            speed={icon.speed}
            offset={icon.offset}
            color={icon.color}
            opacity={opacity}
          />
        ))}
      </group>

      {ENERGY_DOTS.map((dot, i) => (
        <mesh key={i} position={dot.position}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial
            color={RING_COLORS[dot.ringIdx]}
            transparent
            opacity={opacity * dot.opacityMultiplier}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function LightTrail({ index, total, color, opacity }) {
  const ref = useRef(null)
  const angleOffset = (index / total) * Math.PI * 2

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.elapsedTime
    const angle = time * 0.4 + angleOffset
    const r = 2.4 + Math.sin(time * 0.3 + index) * 0.3
    ref.current.position.set(Math.cos(angle) * r, Math.sin(angle * 0.7 + index) * 0.5, Math.sin(angle) * r)
    ref.current.rotation.z = angle
  })

  return (
    <group ref={ref}>
      <mesh>
        <planeGeometry args={[0.4, 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <circleGeometry args={[0.03, 12]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.9} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function OrbitingIcon({ radius, speed, offset, color, opacity }) {
  const ref = useRef(null)
  const angleRef = useRef(offset)

  useFrame((state, delta) => {
    if (!ref.current) return
    angleRef.current += delta * speed
    const angle = angleRef.current
    ref.current.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 0.5 + offset) * 0.8,
      Math.sin(angle) * radius
    )
    ref.current.rotation.y = -angle
    ref.current.rotation.x = Math.sin(angle * 0.5) * 0.2
  })

  return (
    <group ref={ref}>
      <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0.1}>
        {/* Outer glow ring */}
        <mesh>
          <ringGeometry args={[0.12, 0.15, 16]} />
          <meshBasicMaterial color={color} transparent opacity={opacity * 0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* Center icon body — small cube for visual weight */}
        <mesh>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshBasicMaterial color={color} transparent opacity={opacity * 0.9} />
        </mesh>
      </Float>
    </group>
  )
}
