import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Scene() {
  const mesh = useRef(null)
  const { pointer } = useThree()

  useFrame((state) => {
    if (!mesh.current) return
    mesh.current.rotation.x = pointer.y * 0.3
    mesh.current.rotation.y = pointer.x * 0.3 + state.clock.elapsedTime * 0.2
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#3B82F6" />
      <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#7C3AED" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#06B6D4" />

      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh ref={mesh} scale={2.2}>
          <icosahedronGeometry args={[1, 1]} />
          <MeshDistortMaterial
            color="#2563EB"
            emissive="#7C3AED"
            emissiveIntensity={0.2}
            roughness={0.2}
            metalness={0.8}
            distort={0.15}
            speed={2}
            transparent
            opacity={0.95}
          />
        </mesh>
      </Float>

      {/* Orbiting rings */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[2.6, 0.015, 16, 100]} />
        <meshBasicMaterial color="#2563EB" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <torusGeometry args={[3, 0.01, 16, 100]} />
        <meshBasicMaterial color="#7C3AED" transparent opacity={0.2} />
      </mesh>
    </>
  )
}

export default function FloatingGlobe({ className = '' }) {
  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
