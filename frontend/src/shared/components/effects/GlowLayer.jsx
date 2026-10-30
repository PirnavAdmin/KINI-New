import { motion } from "framer-motion";

/**
 * GlowLayer — Renders ambient gradient glow blobs within a section.
 *
 * Wraps children with soft, animated gradient glows that create
 * depth and atmosphere. Each intensity preset controls blob size,
 * opacity, and count.
 *
 * Intensity presets:
 *   "hero"     — largest, brightest (Hero section)
 *   "high"     — medium-large (FeaturedCourses, CardFlip)
 *   "medium"   — medium (WhyChooseUs, Stats)
 *   "low"      — small, subtle (FAQ, Newsletter)
 *   "card"     — very subtle (inside card wrappers)
 *
 * Props:
 *   children  — section content
 *   intensity — key into preset map
 *   colors    — array of hex colors for glow blobs
 *   className — additional classes on wrapper
 */

const PRESETS = {
  hero: {
    blobCount: 3,
    maxSize: 600,
    baseOpacity: 0.12,
    positions: ["top-left", "center", "bottom-right"],
  },
  high: {
    blobCount: 3,
    maxSize: 450,
    baseOpacity: 0.08,
    positions: ["top-right", "bottom-left", "center"],
  },
  medium: {
    blobCount: 2,
    maxSize: 350,
    baseOpacity: 0.06,
    positions: ["top-left", "bottom-right"],
  },
  low: {
    blobCount: 1,
    maxSize: 300,
    baseOpacity: 0.04,
    positions: ["center"],
  },
  card: {
    blobCount: 1,
    maxSize: 200,
    baseOpacity: 0.03,
    positions: ["center"],
  },
};

const POSITION_CLASSES = {
  "top-left": "-top-1/4 -left-1/4",
  "top-right": "-top-1/4 -right-1/4",
  "bottom-left": "-bottom-1/4 -left-1/4",
  "bottom-right": "-bottom-1/4 -right-1/4",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export default function GlowLayer({
  children,
  intensity = "medium",
  colors = ["#e56926", "#108299", "#A6C8FF"],
  className = "",
}) {
  const preset = PRESETS[intensity] || PRESETS.medium;

  return (
    <div className={`relative ${className}`}>
      {/* Ambient glow blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {preset.positions.map((pos, i) => {
          const size = preset.maxSize - i * 60;
          const color = colors[i % colors.length];
          return (
            <motion.div
              key={i}
              className={`absolute ${POSITION_CLASSES[pos]}`}
              style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
                opacity: preset.baseOpacity,
                filter: "blur(80px)",
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [preset.baseOpacity, preset.baseOpacity * 1.3, preset.baseOpacity],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 1.5,
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
