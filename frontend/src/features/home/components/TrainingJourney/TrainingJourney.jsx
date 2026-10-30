import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useInView, useReducedMotion } from "framer-motion";
import {
  STEPS,
  YELLOW_BG,
  YELLOW_DARK,
  DARK_TEXT,
  MUTED_TEXT,
} from "./trainingData";
import TimelineNode from "./TimelineNode";
import AnimatedPath from "./AnimatedPath";
import FloatingParticles from "./FloatingParticles";
import ProgressTracker from "./ProgressTracker";
import StatsOverlay from "./StatsOverlay";

// ─────────────────────────────────────────────────────────────
// Grain texture overlay (SVG filter)
// ─────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03]" aria-hidden="true">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.5" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section Heading
// ─────────────────────────────────────────────────────────────
function SectionHeading() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto mb-8 max-w-3xl px-6 pt-16 text-center sm:pt-20 lg:pt-24"
    >
      {/* Eyebrow */}
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em]"
        style={{
          backgroundColor: "rgba(8,95,167,0.1)",
          color: "#085FA7",
        }}
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#085FA7]" />
        The Journey
      </motion.span>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
        style={{ color: DARK_TEXT }}
      >
        Your{" "}
        <span
          className="bg-gradient-to-r from-[#085FA7] via-[#7C3AED] to-[#5CA347] bg-clip-text text-transparent"
        >
          Training Journey
        </span>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base"
        style={{ color: MUTED_TEXT }}
      >
        From your first line of code to your offer letter — follow a proven
        roadmap built by engineers who've been where you are.
      </motion.p>

      {/* Decorative divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto mt-6 h-1 w-20 origin-center rounded-full"
        style={{
          background:
            "linear-gradient(to right, #085FA7, #7C3AED, #5CA347)",
        }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Celebration Section (after all steps)
// ─────────────────────────────────────────────────────────────
function CelebrationSection({ inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 mx-auto max-w-2xl px-6 pb-20 text-center sm:pb-24"
    >
      {/* Celebration icon */}
      <motion.div
        animate={
          inView
            ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }
            : {}
        }
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(92,163,71,0.15)" }}
      >
        <span className="text-3xl">🎉</span>
      </motion.div>

      <h3
        className="text-2xl font-black tracking-tight sm:text-3xl"
        style={{ color: DARK_TEXT }}
      >
        Ready to Start Your Journey?
      </h3>
      <p
        className="mx-auto mt-2 max-w-md text-sm sm:text-base"
        style={{ color: MUTED_TEXT }}
      >
        Join thousands of students who've transformed their careers. Your first
        class is just one click away.
      </p>

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-extrabold tracking-wide text-white transition-shadow duration-300"
          style={{
            background:
              "linear-gradient(135deg, #085FA7, #7C3AED, #5CA347)",
            boxShadow: "0 8px 24px rgba(8,95,167,0.3)",
          }}
        >
          Start Your Journey
          <svg
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full border-2 px-8 py-3.5 text-sm font-extrabold tracking-wide transition-colors duration-300"
          style={{
            borderColor: "rgba(0,0,0,0.1)",
            color: DARK_TEXT,
          }}
          whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
        >
          Explore Courses
        </motion.button>
      </motion.div>

      {/* Sparkle decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
            style={{
              backgroundColor: ["#085FA7", "#7C3AED", "#5CA347", "#FFD54A", "#FF6B6B"][i],
              transform: `rotate(${angle}deg) translateY(-60px)`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Manga-style decorative elements
// ─────────────────────────────────────────────────────────────
function MangaDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top-right burst */}
      <motion.div
        className="absolute right-[5%] top-[8%] text-6xl font-black italic leading-none opacity-[0.04]"
        style={{ color: DARK_TEXT }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        BOOM
      </motion.div>

      {/* Bottom-left burst */}
      <motion.div
        className="absolute bottom-[15%] left-[3%] text-5xl font-black italic leading-none opacity-[0.03]"
        style={{ color: DARK_TEXT }}
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        WOW
      </motion.div>

      {/* Energy circles */}
      {[
        { top: "12%", left: "8%", size: 120 },
        { top: "35%", right: "5%", size: 80 },
        { top: "60%", left: "3%", size: 100 },
        { top: "85%", right: "8%", size: 60 },
      ].map((circle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            top: circle.top,
            left: circle.left,
            right: circle.right,
            width: circle.size,
            height: circle.size,
            borderColor: `${YELLOW_DARK}20`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main TrainingJourney Component
// ─────────────────────────────────────────────────────────────
export default function TrainingJourney() {
  const reduceMotion = useReducedMotion();

  // ── Scroll progress tracking ──
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (reduceMotion) {
      setProgress(1);
      return;
    }
    const unsub = scrollYProgress.on("change", (v) => setProgress(v));
    return () => unsub();
  }, [scrollYProgress, reduceMotion]);

  // ── Active / completed step tracking ──
  const totalSteps = STEPS.length;
  const activeIndex = useMemo(
    () => Math.min(totalSteps - 1, Math.floor(progress * totalSteps)),
    [progress, totalSteps]
  );
  const completedUntil = useMemo(
    () => Math.max(-1, Math.floor(progress * totalSteps) - 1),
    [progress, totalSteps]
  );

  // ── Progress bar percent ──
  const progressPercent = useMemo(() => progress * 100, [progress]);

  // ── Section in view for celebration ──
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true });

  return (
    <>
      <ProgressTracker
        activeIndex={activeIndex}
        completedUntil={completedUntil}
        progressPercent={progressPercent}
      />

      <section
        ref={sectionRef}
        className="relative overflow-hidden"
        style={{ backgroundColor: YELLOW_BG }}
      >
        {/* Grain texture */}
        <GrainOverlay />

        {/* Blob overlays */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{ backgroundColor: "#FFE082", opacity: 0.4 }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full blur-3xl"
            style={{ backgroundColor: "#FFCA28", opacity: 0.3 }}
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Manga decorations */}
        <MangaDecorations />

        {/* Floating particles */}
        <FloatingParticles
          seed={42}
          count={40}
          glyphCount={20}
          speedLineCount={10}
          blobCount={8}
          color="#8B6B00"
          sectionRef={sectionRef}
        />

        {/* Heading */}
        <SectionHeading />

        {/* ── Timeline scroll track ── */}
        <div ref={scrollRef} className="relative" style={{ minHeight: "220vh" }}>
          <div className="sticky top-0 z-10 flex h-screen w-full items-center overflow-hidden">
            {/* SVG Path */}
            <div className="absolute inset-0">
              <AnimatedPath
                progress={progress}
                reduceMotion={reduceMotion}
                containerWidth={100}
                containerHeight={100}
              />
            </div>

            {/* Timeline nodes */}
            <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
              <div className="relative flex flex-col gap-12 md:gap-16">
                {STEPS.map((step, i) => {
                  const isLeft = i % 2 === 0;
                  return (
                    <div
                      key={step.id}
                      className="relative"
                      style={{
                        paddingLeft: isLeft ? "0" : "2rem",
                        paddingRight: isLeft ? "2rem" : "0",
                      }}
                    >
                      <TimelineNode
                        step={step}
                        index={i}
                        isActive={i === activeIndex}
                        isCompleted={i <= completedUntil}
                        align={isLeft ? "left" : "right"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <StatsOverlay />

        {/* Celebration / CTA */}
        <div ref={ctaRef} className="relative">
          <CelebrationSection inView={ctaInView} />
        </div>
      </section>
    </>
  );
}
