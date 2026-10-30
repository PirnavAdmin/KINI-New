import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import ParticleSystem from '../Effects/ParticleSystem'
import useSceneStore from '../../store/sceneStore'

/**
 * SceneShowcase — Feature showcase with floating 3D cards.
 *
 * CRITICAL FIX:
 * - Hex color constants instead of new THREE.Color() to prevent
 *   ParticleSystem's useMemo from recomputing 10K particle positions
 *
 * Triggered at scroll progress 0.50–0.78.
 */
const PARTICLE_COLOR = 0x6366f1
const CARD_COLORS = [0x6366f1, 0x06b6d4, 0x8b5cf6, 0xec4899, 0xf59e0b]

export default function SceneShowcase() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const groupRef = useRef(null)

  const sceneProgress = (cameraProgress - 0.50) / 0.28
  const opacity = Math.max(0, Math.min(1,
    sceneProgress < 0.1 ? sceneProgress / 0.1 :
    sceneProgress > 0.9 ? (1 - sceneProgress) / 0.1 :
    1
  ))

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
  })

  return (
    <group ref={groupRef} visible={opacity > 0}>
      <ParticleSystem
        shape="helix"
        count={10000}
        color={PARTICLE_COLOR}
        speed={0.3}
        opacity={opacity * 0.4}
      />

      <FeatureCard
        position={[-2.5, 1.5, 0]}
        title="AI-Powered"
        subtitle="Adaptive Learning"
        color={CARD_COLORS[0]}
        opacity={opacity}
        index={0}
      />
      <FeatureCard
        position={[0, 2.5, -0.5]}
        title="1:1 Mentorship"
        subtitle="Industry Experts"
        color={CARD_COLORS[1]}
        opacity={opacity}
        index={1}
      />
      <FeatureCard
        position={[2.5, 1, 0.5]}
        title="Placement"
        subtitle="Guaranteed"
        color={CARD_COLORS[2]}
        opacity={opacity}
        index={2}
      />
      <FeatureCard
        position={[-1.5, -1, 1.5]}
        title="Live Projects"
        subtitle="Real Experience"
        color={CARD_COLORS[3]}
        opacity={opacity}
        index={3}
      />
      <FeatureCard
        position={[1.8, -1.5, -1]}
        title="Certifications"
        subtitle="Industry Validated"
        color={CARD_COLORS[4]}
        opacity={opacity}
        index={4}
      />

      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#6366f1"
          transparent
          opacity={opacity}
        >
          Build Your Future
        </Text>
      </Float>
    </group>
  )
}

function FeatureCard({ position, title, subtitle, color, opacity, index }) {
  const meshRef = useRef(null)
  const glowRef = useRef(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.elapsedTime + index * 1.5

    meshRef.current.position.y = position[1] + Math.sin(time) * 0.1
    meshRef.current.rotation.x = Math.sin(time * 0.7) * 0.03
    meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.03

    if (glowRef.current) {
      glowRef.current.material.opacity = opacity * (0.2 + Math.sin(time * 2) * 0.1)
    }
  })

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <planeGeometry args={[2.2, 1.2]} />
        <meshStandardMaterial
          color="#0f172a"
          transparent
          opacity={opacity * 0.85}
          metalness={0.1}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh ref={glowRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[2.3, 1.3]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity * 0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <Text
        position={[0, 0.15, 0.02]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        transparent
        opacity={opacity}
      >
        {title}
      </Text>

      <Text
        position={[0, -0.2, 0.02]}
        fontSize={0.12}
        color={color}
        anchorX="center"
        anchorY="middle"
        transparent
        opacity={opacity * 0.8}
      >
        {subtitle}
      </Text>
    </group>
  )
}
