import { motion } from "framer-motion";

const ORBS = [
  {
    id: "blue",
    color: "#085FA7",
    opacity: 0.18,
    blur: 160,
    size: 650,
    left: "30%",
    top: "20%",
    x: [0, 20, -15, 10, 0],
    y: [0, -18, 12, -8, 0],
  },

  {
    id: "green",
    color: "#5CA347",
    opacity: 0.12,
    blur: 150,
    size: 500,
    left: "70%",
    top: "30%",
    x: [0, -15, 18, -10, 0],
    y: [0, 12, -18, 8, 0],
  },

  {
    id: "mint",
    color: "#7DD3B2",
    opacity: 0.1,
    blur: 140,
    size: 450,
    left: "50%",
    top: "80%",
    x: [0, 18, -12, 15, 0],
    y: [0, -12, 15, -10, 0],
  },
];

export default function WarpBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Base layer — always visible */}
      <div className="absolute inset-0 bg-[#F7F8FA] dark:bg-[#070B14]" />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(8,95,167,0.08), transparent 45%), radial-gradient(circle at 80% 30%, rgba(92,163,71,0.06), transparent 45%), radial-gradient(circle at 50% 80%, rgba(125,211,178,0.05), transparent 45%)",
        }}
      />

      {/* Floating orbs */}
      {ORBS.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
            background: orb.color,
            opacity: orb.opacity,
            filter: `blur(${orb.blur}px)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: orb.x,
            y: orb.y,
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror",
          }}
        />
      ))}
    </div>
  );
}