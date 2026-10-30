import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'
import ParticleSystem from '../Effects/ParticleSystem'
import useSceneStore from '../../store/sceneStore'

/**
 * SceneNeuralGlobe — A glowing digital globe with neural network connections.
 *
 * CRITICAL FIXES:
 * - Hex color constants instead of new THREE.Color() (prevents useMemo churn)
 * - Stable random positions using useMemo with empty deps (not Math.random() on every render)
 * - BufferGeometry is disposed on unmount to prevent GPU memory leak
 * - NeuralConnectionLines uses useRef for geometry so it persists across renders
 *
 * Triggered at scroll progress 0.20–0.50.
 */
const GLOBE_MAIN_COLOR = 0x0ea5e9
const GLOBE_EMISSIVE = 0x06b6d4
const LINE_COLOR = 0x06b6d4
const RING_COLORS = [0x0ea5e9, 0x6366f1, 0x8b5cf6]
const DOT_COLOR = 0x38bdf8

export default function SceneNeuralGlobe() {
  const cameraProgress = useSceneStore((s) => s.cameraProgress)
  const mousePosition = useSceneStore((s) => s.mousePosition)
  const groupRef = useRef(null)
  const globeRef = useRef(null)

  const sceneProgress = (cameraProgress - 0.20) / 0.30
  const opacity = Math.max(0, Math.min(1,
    sceneProgress < 0.1 ? sceneProgress / 0.1 :
    sceneProgress > 0.9 ? (1 - sceneProgress) / 0.1 :
    1
  ))

  // Stable random positions — computed once, never changes
  const dataPoints = useMemo(() => {
    const points = []
    for (let i = 0; i < 20; i++) {
      points.push({
        position: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
        ],
        speed: 0.5 + Math.random() * 0.5,
        floatIntensity: 0.1 + Math.random() * 0.2,
        dotOpacity: 0.3 + Math.random() * 0.4,
      })
    }
    return points
  }, [])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime

    if (globeRef.current) {
      const targetRotY = time * 0.15 + (mousePosition[0] - 0.5) * 0.2
      const targetRotX = Math.sin(time * 0.1) * 0.1 + (mousePosition[1] - 0.5) * 0.1
      globeRef.current.rotation.y += (targetRotY - globeRef.current.rotation.y) * delta * 3
      globeRef.current.rotation.x += (targetRotX - globeRef.current.rotation.x) * delta * 3
    }

    const pulse = 1 + Math.sin(time * 1.5) * 0.02
    groupRef.current.scale.setScalar(pulse)
  })

  return (
    <group ref={groupRef} visible={opacity > 0}>
      <ParticleSystem
        shape="sphere"
        count={15000}
        color={GLOBE_EMISSIVE}
        speed={0.4}
        opacity={opacity * 0.6}
      />

      <group ref={globeRef}>
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <Sphere args={[1.8, 64, 64]}>
            <MeshDistortMaterial
              color={GLOBE_MAIN_COLOR}
              emissive={GLOBE_EMISSIVE}
              emissiveIntensity={0.3}
              roughness={0.1}
              metalness={0.9}
              distort={0.05}
              speed={1}
              transparent
              opacity={opacity * 0.95}
            />
          </Sphere>

          <Sphere args={[2.2, 32, 32]}>
            <meshBasicMaterial
              color={GLOBE_EMISSIVE}
              transparent
              opacity={opacity * 0.05}
              side={THREE.BackSide}
            />
          </Sphere>
        </Float>

        {opacity > 0.1 && (
          <NeuralConnectionLines count={60} radius={2.2} opacity={opacity} />
        )}

        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.8, i * 0.5, 0]}>
            <torusGeometry args={[2.6 + i * 0.4, 0.01, 16, 64]} />
            <meshBasicMaterial
              color={RING_COLORS[i]}
              transparent
              opacity={opacity * (0.4 - i * 0.1)}
            />
          </mesh>
        ))}
      </group>

      {/* Stable floating data points — no Math.random() on render */}
      {dataPoints.map((pt, i) => (
        <Float key={i} speed={pt.speed} floatIntensity={pt.floatIntensity}>
          <mesh position={pt.position}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshBasicMaterial
              color={DOT_COLOR}
              transparent
              opacity={opacity * pt.dotOpacity}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

/**
 * NeuralConnectionLines — Animated lines between sphere points.
 * Geometry is created once via useMemo and disposed on unmount.
 */
function NeuralConnectionLines({ count = 60, radius = 2.2, opacity = 1 }) {
  const linesRef = useRef(null)
  const geoRef = useRef(null)

  const points = useMemo(() =>
    Array.from({ length: count }, () => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      return { theta, phi }
    }), [count])

  const lineGeometry = useMemo(() => {
    const positions = []
    const colorArr = []
    const color = new THREE.Color(LINE_COLOR)
    const vectors = points.map((p) => new THREE.Vector3(
      radius * Math.sin(p.phi) * Math.cos(p.theta),
      radius * Math.sin(p.phi) * Math.sin(p.theta),
      radius * Math.cos(p.phi)
    ))

    for (let i = 0; i < vectors.length; i++) {
      for (let j = i + 1; j < vectors.length; j++) {
        const dist = vectors[i].distanceTo(vectors[j])
        if (dist < 2 && dist > 0.5 && Math.random() < 0.3) {
          positions.push(vectors[i].x, vectors[i].y, vectors[i].z)
          positions.push(vectors[j].x, vectors[j].y, vectors[j].z)
          const alpha = 1 - dist / 2
          colorArr.push(color.r * alpha, color.g * alpha, color.b * alpha)
          colorArr.push(color.r * alpha, color.g * alpha, color.b * alpha)
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colorArr, 3))
    geoRef.current = geo
    return geo
  }, [points, radius])

  // Dispose geometry on unmount to prevent GPU memory leak
  useEffect(() => {
    return () => {
      if (geoRef.current) {
        geoRef.current.dispose()
        geoRef.current = null
      }
    }
  }, [])

  useFrame((state) => {
    if (!linesRef.current) return
    const time = state.clock.elapsedTime
    linesRef.current.material.opacity = opacity * (0.3 + Math.sin(time * 0.5) * 0.2)
  })

  return (
    <lineSegments ref={linesRef} geometry={lineGeometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={opacity * 0.4}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}
