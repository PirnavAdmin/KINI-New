import { useMemo } from "react";
import { motion } from "framer-motion";
import { NODE_POSITIONS, YELLOW_DARK, ACCENT_COLOR, SUCCESS_COLOR } from "./trainingData";

// ─────────────────────────────────────────────────────────────
// Build a smooth curved SVG path through all node positions
// ─────────────────────────────────────────────────────────────
function buildSmoothPath(positions) {
  if (!positions.length) return "";
  let d = `M ${positions[0].x} ${positions[0].y}`;

  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x} ${midY}, ${midX} ${midY}`;
    d += ` Q ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }

  return d;
}

// ─────────────────────────────────────────────────────────────
// Seeded pseudo-random for particle layout
// ─────────────────────────────────────────────────────────────
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─────────────────────────────────────────────────────────────
// Traveling particles along the path
// ─────────────────────────────────────────────────────────────
function PathParticles({ pathD, reduceMotion, count = 5 }) {
  if (reduceMotion) return null;

  const particles = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      delay: i * 0.8,
      duration: 3 + rand() * 2,
      size: 3 + rand() * 3,
      color: [ACCENT_COLOR, SUCCESS_COLOR, "#FFD700"][i % 3],
    }));
  }, [count]);

  return (
    <>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          r={p.size}
          fill={p.color}
          opacity={0.7}
          style={{ offsetPath: `path("${pathD}")` }}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main AnimatedPath component
// ─────────────────────────────────────────────────────────────
export default function AnimatedPath({
  progress,
  reduceMotion = false,
  containerWidth = 100,
  containerHeight = 100,
}) {
  const positions = useMemo(() => {
    // Scale positions to SVG viewBox coordinates
    const padding = 8;
    const usableW = containerWidth - padding * 2;
    const usableH = containerHeight - padding * 2;

    return NODE_POSITIONS.map((p) => ({
      x: (p.x / 100) * usableW + padding,
      y: (p.y / 100) * usableH + padding,
    }));
  }, [containerWidth, containerHeight]);

  const pathD = useMemo(() => buildSmoothPath(positions), [positions]);

  const viewBox = `0 0 ${containerWidth} ${containerHeight}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={viewBox}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={ACCENT_COLOR} />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor={SUCCESS_COLOR} />
        </linearGradient>
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pathBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Faint full-length guide path */}
      <path
        d={pathD}
        stroke={YELLOW_DARK}
        strokeOpacity="0.15"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glow behind the animated path */}
      <motion.path
        d={pathD}
        stroke="url(#pathGrad)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pathBlur)"
        opacity={0.15}
        style={{ pathLength: progress }}
      />

      {/* Animated gradient path */}
      <motion.path
        d={pathD}
        stroke="url(#pathGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#pathGlow)"
        style={{ pathLength: progress }}
      />

      {/* Dashed animated segments on the drawn portion */}
      <motion.path
        d={pathD}
        stroke="url(#pathGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 12"
        opacity={0.2}
        style={{ pathLength: progress }}
      />

      {/* Traveling particles */}
      <PathParticles pathD={pathD} reduceMotion={reduceMotion} count={6} />
    </svg>
  );
}
