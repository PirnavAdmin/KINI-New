import { useMemo, useRef, useCallback } from "react";
import { motion, useInView } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Seeded pseudo-random for stable particle positions
// ─────────────────────────────────────────────────────────────
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ─────────────────────────────────────────────────────────────
// Manga-inspired glyphs for floating particles
// ─────────────────────────────────────────────────────────────
const MANGA_GLYPHS = ["✦", "✧", "★", "⚡", "◆", "◇", "○", "●", "△", "▽", "✿", "❖"];
const SPEED_LINE_LENGTHS = [40, 60, 80, 100, 120];

// ─────────────────────────────────────────────────────────────
// Single particle: glyph, speed line, or blob
// ─────────────────────────────────────────────────────────────
function Particle({ particle, color }) {
  if (particle.type === "glyph") {
    return (
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-bold"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          fontSize: particle.size,
          color: particle.color,
        }}
        animate={{
          y: [0, -20, 0],
          opacity: [0.08, 0.3, 0.08],
          rotate: [0, 15, 0],
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {particle.glyph}
      </motion.span>
    );
  }

  if (particle.type === "speed-line") {
    return (
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: particle.length,
          height: 2,
          borderRadius: 1,
          backgroundColor: particle.color,
          transform: `rotate(${particle.rotation}deg)`,
          transformOrigin: "left center",
        }}
        animate={{
          opacity: [0, 0.35, 0],
          scaleX: [0, 1, 0],
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    );
  }

  // blob / organic shape
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-full blur-3xl"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        backgroundColor: particle.color,
      }}
      animate={{
        x: [0, particle.driftX, 0],
        y: [0, particle.driftY, 0],
        scale: [1, 1.3, 1],
        opacity: [0.04, 0.1, 0.04],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Main FloatingParticles component
// ─────────────────────────────────────────────────────────────
export default function FloatingParticles({
  seed = 42,
  count = 35,
  glyphCount = 18,
  speedLineCount = 8,
  blobCount = 9,
  color = "#8B6B00",
  sectionRef,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.05 });

  const particles = useMemo(() => {
    if (!inView) return [];
    const rand = seeded(seed);

    const items = [];

    // Glyphs
    for (let i = 0; i < glyphCount; i++) {
      items.push({
        id: `glyph-${i}`,
        type: "glyph",
        glyph: MANGA_GLYPHS[Math.floor(rand() * MANGA_GLYPHS.length)],
        x: rand() * 100,
        y: rand() * 100,
        size: 10 + rand() * 22,
        color: [color, "#B8860B", "#DAA520"][Math.floor(rand() * 3)],
        delay: rand() * 5,
        duration: 3 + rand() * 4,
      });
    }

    // Speed lines
    for (let i = 0; i < speedLineCount; i++) {
      items.push({
        id: `speed-${i}`,
        type: "speed-line",
        x: rand() * 100,
        y: rand() * 100,
        length: SPEED_LINE_LENGTHS[Math.floor(rand() * SPEED_LINE_LENGTHS.length)],
        rotation: rand() * 360,
        color: color,
        delay: rand() * 3,
        duration: 1.5 + rand() * 1.5,
      });
    }

    // Blobs
    for (let i = 0; i < blobCount; i++) {
      items.push({
        id: `blob-${i}`,
        type: "blob",
        x: rand() * 100,
        y: rand() * 100,
        size: 40 + rand() * 120,
        color: ["#FFD54A", "#FFE082", "#FFCA28"][Math.floor(rand() * 3)],
        driftX: (rand() - 0.5) * 60,
        driftY: (rand() - 0.5) * 60,
        delay: rand() * 2,
        duration: 6 + rand() * 6,
      });
    }

    return items;
  }, [inView, seed, glyphCount, speedLineCount, blobCount, color]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <Particle key={p.id} particle={p} color={color} />
      ))}
    </div>
  );
}
