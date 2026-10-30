import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, DepthOfField, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import useSceneStore from '../../store/sceneStore'
import usePerformance from '../../hooks/usePerformance'

/**
 * PostProcessing — Applies cinematic post-processing effects.
 *
 * Effects:
 * - Bloom: Glow on bright areas (emissive materials)
 * - Depth of Field: Cinematic focus blur
 * - Tone Mapping: HDR to LDR conversion
 * - Vignette: Darkened edges
 *
 * Effects are disabled on low-performance devices.
 */
export default function PostProcessing() {
  const { enablePostProcessing: storeEnabled } = useSceneStore()
  const { detailLevel } = usePerformance()
  const { camera } = useThree()

  // Adaptive intensity based on performance
  const bloomIntensity = detailLevel >= 2 ? 0.8 : detailLevel >= 1 ? 0.5 : 0
  const dofEnabled = detailLevel >= 2

  // Don't render if disabled or low performance
  if (!storeEnabled || detailLevel < 1) return null

  return (
    <EffectComposer multisampling={detailLevel >= 2 ? 4 : 0}>
      {/* Bloom — Glow effect */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
        blendFunction={BlendFunction.ADD}
      />

      {/* Depth of Field — Cinematic blur */}
      {dofEnabled && (
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
      )}

      {/* Tone Mapping — HDR to LDR */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Vignette — Dark corners */}
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}
