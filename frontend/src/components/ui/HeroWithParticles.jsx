import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import ParticlesBg from "@/components/ui/ParticlesBg";

/* ──────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ────────────────────────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ──────────────────────────────────────────────────────────────
   HERO WITH PARTICLES BACKGROUND
   ────────────────────────────────────────────────────────────── */
export default function HeroWithParticles() {
  return (
    <section className="relative min-h-screen">
      {/* ── FULL-BLEED PARTICLES BACKGROUND ────────────────── */}
      <ParticlesBg className="absolute inset-0" showGradient showNoise showParticles />

      {/* ── EXTRA GLOW ORBS FOR DEPTH (optional) ──────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "#085FA7" }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ background: "#5CA347" }}
        />
      </div>

      {/* ── HERO CONTENT ───────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center lg:px-8"
      >
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide"
          style={{
            borderColor: "rgba(8,95,167,0.2)",
            color: "#085FA7",
            background: "rgba(8,95,167,0.06)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Kini EduTech — Empowering Futures</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[0.92] tracking-[-0.04em]"
          style={{ color: "#0F172A" }}
        >
          Learn Without
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #085FA7 0%, #5CA347 50%, #F0765B 100%)",
            }}
          >
            Limits
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-2xl text-lg leading-relaxed"
          style={{ color: "#475569" }}
        >
          Master in-demand skills with AI-powered learning paths, live mentorship,
          and industry-recognized certifications — tailored to your career goals.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{
              background:
                "linear-gradient(135deg, #085FA7 0%, #1A7ACA 100%)",
              boxShadow: "0 8px 32px rgba(8,95,167,0.3)",
            }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started Free
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.a>

          <motion.a
            href="/courses"
            className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 text-sm font-semibold transition-all duration-300"
            style={{
              borderColor: "rgba(8,95,167,0.2)",
              color: "#085FA7",
            }}
            whileHover={{ scale: 1.04, y: -2, borderColor: "#085FA7" }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Courses
          </motion.a>
        </motion.div>

        {/* Trust indicator */}
        <motion.div
          variants={fadeUp}
          className="mt-16 flex items-center gap-8 text-xs font-medium tracking-wide uppercase"
          style={{ color: "#94A3B8" }}
        >
          <span>Trusted by 10K+ students</span>
          <span className="h-4 w-px" style={{ background: "#E2E8F0" }} />
          <span>4.9 ⭐ avg rating</span>
          <span className="h-4 w-px" style={{ background: "#E2E8F0" }} />
          <span>50+ expert mentors</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
