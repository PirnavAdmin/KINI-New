import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import ParticleSystem from '../Effects/ParticleSystem'
import StarField from '../Effects/StarField'
import useSceneStore from '../../store/sceneStore'

/**
 * SceneGalaxy — Opening scene set in deep space.
 *
 * CRITICAL FIXES:
 * - Uses hex color constants (0x...) instead of `new THREE.Color('#...')` to
 *   prevent ParticleSystem's useMemo from recomputing 20K particle positions
 *   on every render (object reference changed each render)
 * - Pre-computed opacity derived from cameraProgress to avoid Math in render
 * - All ring materials are stable between renders
 *
 * Triggered at scroll progress 0.0–0.20.
 */
const GALAXY_COLOR = 0x6366f1
const RING_COLOR_1 = 0x6366f1
const RING_COLOR_2 = 0x8b5cf6
const NEBULA_COLOR_1 = 0x6366f1
const NEBULA_COLOR_2 = 0x8b5cf6

export default function SceneGalaxy() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const groupRef = useRef(null)
  const logoRef = useRef(null)
  const ringRef = useRef(null)

  // Compute opacity once per render — stable value derived from scroll
  const opacity = Math.max(0, Math.min(1,
    1 - Math.max(0, (cameraProgress - 0.15) / 0.05)
  ))

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    groupRef.current.rotation.y = time * 0.02
    groupRef.current.rotation.x = Math.sin(time * 0.01) * 0.05

    if (logoRef.current) {
      const s = 1 + Math.sin(time * 2) * 0.02
      logoRef.current.scale.set(s, s, s)
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.3) * 0.1
      ringRef.current.rotation.z += 0.0032
    }
  })

  return (
    <group ref={groupRef} visible={opacity > 0}>
      <StarField count={2000} speed={0.01} />

      <ParticleSystem
        shape="galaxy"
        count={20000}
        color={GALAXY_COLOR}
        speed={0.3}
        opacity={opacity * 0.7}
      />

      {/* Central glowing rings */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 2.8, 64]} />
          <meshBasicMaterial
            color={RING_COLOR_1}
            transparent
            opacity={opacity * 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <ringGeometry args={[3.2, 3.5, 64]} />
          <meshBasicMaterial
            color={RING_COLOR_2}
            transparent
            opacity={opacity * 0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Nebula glow spheres */}
      <mesh position={[2, 1, -3]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color={NEBULA_COLOR_1} transparent opacity={opacity * 0.05} />
      </mesh>
      <mesh position={[-2, -1, -4]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color={NEBULA_COLOR_2} transparent opacity={opacity * 0.04} />
      </mesh>

      {/* Floating logo text */}
      <group ref={logoRef}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.8}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#6366f1"
          >
            KINIEDXHUB
          </Text>
        </Float>
      </group>

      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
        opacity={opacity * 0.7}
        transparent
      >
        Where Talent Meets Opportunity
      </Text>
    </group>
  )
}
