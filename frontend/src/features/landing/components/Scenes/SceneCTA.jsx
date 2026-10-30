import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import ParticleSystem from '../Effects/ParticleSystem'
import useSceneStore from '../../store/sceneStore'

/**
 * SceneCTA — Final call-to-action scene with hero glow and energy rings.
 *
 * CRITICAL FIXES:
 * - Hex color constants instead of new THREE.Color() to prevent
 *   ParticleSystem's useMemo from recomputing 25K particle positions
 * - Stable particle positions created once via CSSMathValue pattern
 *
 * Triggered at scroll progress 0.78–1.0.
 */
const PARTICLE_COLOR = 0x6366f1
const SPHERE_COLOR = 0x6366f1
const RING_COLORS = [0x6366f1, 0x06b6d4]
const GLOW_COLOR = 0x6366f1

export default function SceneCTA() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const groupRef = useRef(null)
  const ctaPulseRef = useRef(null)

  const sceneProgress = (cameraProgress - 0.78) / 0.22
  const opacity = Math.max(0, Math.min(1,
    sceneProgress < 0.1 ? sceneProgress / 0.1 : 1
  ))

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    if (ctaPulseRef.current) {
      const s = 1 + Math.sin(time * 1.5) * 0.02
      ctaPulseRef.current.scale.set(s, s, s)
    }

    groupRef.current.rotation.y = time * 0.01
  })

  return (
    <group ref={groupRef} visible={opacity > 0}>
      <ParticleSystem
        shape="galaxy"
        count={25000}
        color={PARTICLE_COLOR}
        speed={0.6}
        opacity={opacity * 0.5}
      />

      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial
          color={SPHERE_COLOR}
          transparent
          opacity={opacity * 0.03}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Energy rings */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.4, i * 0.7, 0]}>
          <torusGeometry args={[3 + i * 0.5, 0.015, 16, 80]} />
          <meshBasicMaterial
            color={RING_COLORS[i % 2]}
            transparent
            opacity={opacity * (0.3 - i * 0.05)}
          />
        </mesh>
      ))}

      <group ref={ctaPulseRef}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.6}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#6366f1"
            transparent
            opacity={opacity}
          >
            Start Your Journey
          </Text>
        </Float>

        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          transparent
          opacity={opacity * 0.7}
        >
          Join 20,000+ Students Already Placed
        </Text>

        <mesh position={[0, -1.5, 0]}>
          <planeGeometry args={[3, 0.6]} />
          <meshBasicMaterial
            color={GLOW_COLOR}
            transparent
            opacity={opacity * 0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </group>
  )
}
