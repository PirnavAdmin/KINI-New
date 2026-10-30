import { motion } from "framer-motion";

const particles = Array.from({ length: 30 }, (_, i) => ({
  size: 2 + ((i * 17) % 50) / 10,
  left: (i * 37) % 100,
  duration: 10 + ((i * 29) % 120) / 10,
  delay: ((i * 13) % 50) / 10,
}));

export default function HeroBackground() {
  return (
    <>
      {/* Main Gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg,#07103f 0%,#111963 48%,#20126f 100%)",
            "linear-gradient(135deg,#081342 0%,#14206e 48%,#261573 100%)",
            "linear-gradient(135deg,#07103f 0%,#111963 48%,#20126f 100%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
 
      {/* Purple Glow */}
      <motion.div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(15,85,247,.30) 0%, transparent 70%)",
        }}
        animate={{
          x: [-30, 30, -30],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
 
      {/* Blue Glow */}
      <motion.div
        className="absolute -bottom-52 -right-44 h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,168,.20) 0%, transparent 70%)",
        }}
        animate={{
          x: [30, -20, 30],
          y: [20, -20, 20],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
 
      {/* Center Glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(15,85,247,.18) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />
 
      {/* Premium Grid */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
 
      {/* Moving Light */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%)",
        }}
        animate={{
          x: ["-100%", "120%"],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
 
      {/* Floating Particles */}
      {particles.map(({ size, left, duration, delay }, i) => {
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-brand/50"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: "-20px",
              filter: "blur(1px)",
            }}
            animate={{
              y: [-10, -900],
              opacity: [0, 1, 1, 0],
              scale: [0.3, 1.2, 1],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "linear",
            }}
          />
        );
      })}
 
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/asfalt-light.png')",
        }}
      />
    </>
  );
}
 
