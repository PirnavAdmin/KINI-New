import { memo } from "react";
import GlowLayer from "./GlowLayer";
import ParticleLayer from "./ParticleLayer";

/**
 * SectionGlow — Combined section wrapper.
 *
 * Wraps a section with:
 *   1. Ambient glow blobs (GlowLayer)
 *   2. Optional drifting particles (ParticleLayer)
 *   3. Proper ARIA and pointer-events handling
 *
 * Each named section type maps to intensity/particle presets.
 *
 * Props:
 *   section  — key into SECTION_PRESETS (or custom object)
 *   children — section content
 *   colors   — brand color array (optional, uses presets)
 *   className — additional wrapper classes
 */

const SECTION_PRESETS = {
  hero: {
    intensity: "hero",
    particles: true,
    particleCount: 40,
    particleSpeed: 0.3,
  },
  trusted: {
    intensity: "low",
    particles: false,
  },
  categories: {
    intensity: "medium",
    particles: true,
    particleCount: 30,
  },
  featuredCourses: {
    intensity: "high",
    particles: true,
    particleCount: 35,
  },
  cardFlip: {
    intensity: "high",
    particles: true,
    particleCount: 30,
  },
  learningPaths: {
    intensity: "medium",
    particles: true,
    particleCount: 25,
  },
  learningProcess: {
    intensity: "medium",
    particles: false,
  },
  whyChooseUs: {
    intensity: "medium",
    particles: true,
    particleCount: 20,
  },
  stats: {
    intensity: "high",
    particles: true,
    particleCount: 35,
  },
  testimonials: {
    intensity: "medium",
    particles: true,
    particleCount: 40,
  },
  placementPartners: {
    intensity: "low",
    particles: false,
  },
  faq: {
    intensity: "low",
    particles: true,
    particleCount: 15,
  },
  newsletter: {
    intensity: "low",
    particles: true,
    particleCount: 20,
  },
  cta: {
    intensity: "low",
    particles: true,
    particleCount: 25,
  },
  default: {
    intensity: "medium",
    particles: true,
    particleCount: 20,
  },
};

function SectionGlow({
  section = "default",
  children,
  colors = ["#e56926", "#108299", "#A6C8FF", "#5227FF"],
  className = "",
}) {
  const preset =
    typeof section === "string"
      ? SECTION_PRESETS[section] || SECTION_PRESETS.default
      : { ...SECTION_PRESETS.default, ...section };

  return (
    <div className={`relative ${className}`}>
      {/* Background particles (behind content) */}
      {preset.particles && (
        <ParticleLayer
          count={preset.particleCount || 20}
          colors={colors}
          speed={preset.particleSpeed || 0.4}
          mouseRadius={160}
          mouseStrength={0.3}
        />
      )}

      {/* Glow blobs */}
      <GlowLayer intensity={preset.intensity} colors={colors}>
        {children}
      </GlowLayer>
    </div>
  );
}

export default memo(SectionGlow);
