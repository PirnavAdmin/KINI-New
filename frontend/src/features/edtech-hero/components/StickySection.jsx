import { motion } from "framer-motion";

/* ──────────────────────────────────────────────────────────────
   STICKY SECTION — Reusable sticky-scroll building block
   ──────────────────────────────────────────────────────────────
   Props:
     theme     "dark" | "light"          default: "dark"
     className  additional wrapper classes
     children   content to render inside
     animate   whether to animate children on scroll   default: true
   ────────────────────────────────────────────────────────────── */

const GRID_BASE = {
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
  `,
  backgroundSize: "64px 64px",
};

const LIGHT_GRID = {
  backgroundImage: `
    linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
  `,
  backgroundSize: "64px 64px",
};

const SECTION_THEMES = {
  dark: {
    bg: "bg-[#071226]",
    text: "text-white",
    subtext: "text-white/50",
    grid: GRID_BASE,
    glow: "rgba(99,102,241,0.06)",
  },
  light: {
    bg: "bg-white",
    text: "text-[#0F172A]",
    subtext: "text-slate-500",
    grid: LIGHT_GRID,
    glow: "rgba(8,95,167,0.04)",
  },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-15%" },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function StickySection({
  theme = "dark",
  className = "",
  animate = true,
  children,
}) {
  const t = SECTION_THEMES[theme] ?? SECTION_THEMES.dark;

  return (
    <section
      className={`sticky top-0 h-screen flex items-center justify-center overflow-x-hidden ${t.bg} ${className}`}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={t.grid}
      />

      {/* Glow orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${t.glow}, transparent 60%)`,
        }}
      />

      {/* Top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)",
        }}
      />

      {/* Content — only animate when the `animate` prop is true */}
      {animate ? (
        <motion.div className="relative z-10 w-full" {...fadeUp(0.1)}>
          {children}
        </motion.div>
      ) : (
        <div className="relative z-10 w-full">{children}</div>
      )}
    </section>
  );
}
