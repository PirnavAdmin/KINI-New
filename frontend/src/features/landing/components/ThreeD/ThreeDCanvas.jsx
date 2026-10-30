import { useEffect, useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import CameraController from '../Camera/CameraController'
import HolographicSphere from '../ThreeD/HolographicSphere'
import PostProcessing from '../Effects/PostProcessing'
import StarField from '../Effects/StarField'
import CursorLight from '../Effects/CursorLight'
import useSceneStore from '../../store/sceneStore'
import usePerformance from '../../hooks/usePerformance'

/**
 * ThreeDCanvas — Bounded 3D canvas for the right-column 45% layout.
 *
 * Uses sticky positioning (not fixed) so it stays within the parent
 * container's width, preventing overflow on ultrawide screens.
 *
 * Architecture:
 * - HolographicSphere is the single centerpiece (no text inside)
 * - CameraController drives the camera along the spline path
 * - CursorLight provides interactive spotlight following the mouse
 * - StarField adds background depth with distant stars
 * - PostProcessing adds bloom, DOF, tone mapping
 * - Environment provides HDR reflections for the glass sphere
 */

/**
 * Suppress known-benign Three.js console warnings.
 *
 * These warnings are harmless but spam the console:
 * 1. D3D/HLSL shader precision warnings (X4122) from ANGLE on Windows
 * 2. THREE.Clock deprecation — R3F internally creates one, waiting for R3F to
 *    adopt THREE.Timer
 * 3. THREE.WebGLRenderer: Context Lost. — Redundant with our own handler
 *
 * The filter is component-scoped: active while mounted, cleaned up on unmount.
 */
function useSuppressBenignWarnings() {
  useEffect(() => {
    const originalWarn = console.warn
    console.warn = (...args) => {
      const first = typeof args[0] === 'string' ? args[0] : ''
      if (
        (first.startsWith('THREE.WebGLProgram:') && first.includes('warning X4122')) ||
        first.startsWith('THREE.Clock:') ||
        first.startsWith('THREE.WebGLRenderer: Context Lost.') ||
        first.includes('WebGL context lost')
      ) {
        return // suppress known-benign warnings
      }
      originalWarn(...args)
    }
    return () => {
      console.warn = originalWarn
    }
  }, [])
}

function useSceneFallback() {
  const [contextLost, setContextLost] = useState(false)
  const listenersRef = useRef(null)

  const onCreated = (state) => {
    const canvas = state.gl.domElement
    if (listenersRef.current) return // already set up

    const onLost = (e) => {
      e.preventDefault()
      setContextLost(true)
      console.info('WebGL context lost — showing fallback')
    }

    const onRestored = () => {
      setContextLost(false)
      console.info('WebGL context restored')
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    listenersRef.current = { canvas, onLost, onRestored }
  }

  // Cleanup on unmount — reset guard so remount can re-attach
  useEffect(() => {
    return () => {
      if (listenersRef.current) {
        const { canvas, onLost, onRestored } = listenersRef.current
        canvas.removeEventListener('webglcontextlost', onLost)
        canvas.removeEventListener('webglcontextrestored', onRestored)
        listenersRef.current = null // allow re-attach on StrictMode remount
      }
    }
  }, [])

  return { contextLost, onCreated }
}

function ThreeDScene() {
  const { enableShadows } = useSceneStore()
  const { detailLevel } = usePerformance()

  return (
    <>
      <CameraController />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#6366f1" castShadow={enableShadows} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#8b5cf6" />
      <hemisphereLight args={['#6366f1', '#020617', 0.4]} />
      <CursorLight />
      {detailLevel >= 1 && (
        <Suspense fallback={null}>
          <Environment preset="night" />
        </Suspense>
      )}
      <fog attach="fog" args={['#020617', 12, 25]} />
      <StarField count={3000} speed={0.01} />
      <HolographicSphere />
      {detailLevel >= 1 && <PostProcessing />}
    </>
  )
}

function ContextLostFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: '#020617' }}>
      <div className="text-center px-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-slate-400 text-sm">
          Your GPU is taking a moment to catch up.
          <br />
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Reload the page
          </button>
        </p>
      </div>
    </div>
  )
}

export default function ThreeDCanvas() {
  useSuppressBenignWarnings()
  const { pixelRatio, performanceTier } = useSceneStore()
  const powerPreference = performanceTier === 'high' ? 'high-performance' : 'default'
  const { contextLost, onCreated } = useSceneFallback()

  if (contextLost) {
    return (
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: '#020617' }}>
        <ContextLostFallback />
      </div>
    )
  }

  return (
    <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: '#020617' }}>
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, Math.min(pixelRatio, 1.5)]}
        onCreated={onCreated}
        gl={{
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ThreeDScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
