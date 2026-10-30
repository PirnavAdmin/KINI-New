import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, MessageCircle, Target } from "lucide-react";
import heroImage from "../../../../../public/hero-student.webp";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #0E3B5C 0%, #123F60 35%, #0B3554 65%, #0F2E49 100%)",
      }}
    >
      {/* ── Subtle background texture ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ── Soft glow accents ── */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-[550px] w-[550px] rounded-full bg-secondary-500/[0.05] blur-[180px]" />
        <div className="absolute -bottom-48 -right-48 h-[450px] w-[450px] rounded-full bg-primary-300/[0.06] blur-[160px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
         Main Grid — 2-column layout
         Left ~45% / Right ~55%
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto grid w-full max-w-[1580px] grid-cols-1 items-center
        gap-8 px-5 pt-14 pb-14
        sm:px-8 sm:pt-16 sm:pb-16
        lg:min-h-[calc(100svh-0px)] lg:grid-cols-[45fr_55fr] lg:gap-4 lg:px-12 lg:pt-14 lg:pb-14
        xl:px-20">

        {/* ══════════════════════════════════════════════════════════════════════
           LEFT — Hero Content
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="text-center lg:text-left">
          {/* Badge — muted blue/translucent, subtle */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] border border-white/[0.08] px-4 py-1.5 text-[11px] font-medium tracking-wide text-white/70 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-500/80" />
            Future-Ready Corporate Training Platform
          </span>

          {/* Main Heading — sized to stay on its two intended lines at lg+ */}
          <h1 className="mt-4 font-black leading-[1.1] tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(2.25rem, 3.2vw, 3.75rem)" }}>
            Empowering{" "}
            <span className="text-secondary-500">Minds.</span>
            <br />
            Building{" "}
            <span className="text-secondary-500">Futures.</span>
          </h1>

          {/* Supporting paragraph */}
          <p className="mt-4 mx-auto max-w-[520px] leading-[1.7] text-white/50 lg:mx-0"
            style={{ fontSize: "clamp(0.9375rem, 1.2vw, 1.25rem)" }}>
            Master industry skills with live training, projects, mentorship and placement assistance.
          </p>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              to="/programs"
              className="group inline-flex items-center justify-center gap-2
                rounded-full bg-secondary-500 px-7 py-3 text-sm font-semibold text-primary-950
                transition-all duration-300 hover:scale-[1.03] hover:bg-secondary-400
                sm:px-8 sm:py-3.5"
            >
              <span className="flex items-center gap-2">
                Explore Programs
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary-700 text-secondary-500 border border-secondary-500 px-7 py-3 text-sm font-semibold
                transition-all duration-300 hover:bg-primary-600 sm:px-8 sm:py-3.5"
            >
              Talk to an Advisor
            </Link>
          </div>

          {/* ── Decorative Education Icons — spread around hero ── */}
          <div className="absolute inset-0 pointer-events-none hidden lg:block" aria-hidden="true">
            {/* Rocket — upper-middle area */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity }}
              className="absolute left-[45%] top-[12%] opacity-[0.2]"
            >
              <Rocket className="h-5 w-5 text-secondary-400" strokeWidth={1.5} />
            </motion.div>
            {/* Chat/message — lower-middle-left */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.8 }}
              className="absolute left-[8%] bottom-[22%] opacity-[0.16]"
            >
              <MessageCircle className="h-[18px] w-[18px] text-secondary-300" strokeWidth={1.5} />
            </motion.div>
            {/* Target — lower-right near image */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, delay: 1.4 }}
              className="absolute right-[8%] bottom-[18%] opacity-[0.16]"
            >
              <Target className="h-[18px] w-[18px] text-secondary-400" strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
           RIGHT — Student Image with Organic Blobs
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="relative flex justify-center lg:justify-end">
          {/* ── Composition Wrapper ── */}
          <div className="relative h-[min(80vw,420px)] w-[min(80vw,420px)] sm:h-[360px] sm:w-[360px] lg:h-[380px] lg:w-[380px] xl:h-[420px] xl:w-[420px]">

            {/* A. Orange/Yellow organic blob — rear layer (z-10) */}
            <div className="absolute inset-0 z-[10]" aria-hidden="true">
              <motion.div
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.03, 1], rotate: [0, 2, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 -top-6 h-[72%] w-[68%] sm:-right-6 sm:-top-8 sm:h-[75%] sm:w-[70%] lg:-right-4 lg:-top-6"
                style={{
                  background: "linear-gradient(135deg, #F5A623 0%, #FFAA1D 45%, #F39924 100%)",
                  borderRadius: "62% 38% 48% 52% / 44% 58% 42% 56%",
                  opacity: 0.75,
                }}
              />
            </div>

            {/* B. White organic blob — mid layer (z-20) */}
            <div className="absolute inset-0 z-[20]" aria-hidden="true">
              <motion.div
                animate={shouldReduceMotion ? undefined : { scale: [1, 1.015, 1], rotate: [0, -1, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute inset-[6%] sm:inset-[5%] lg:inset-[4%]"
                style={{
                  background: "linear-gradient(155deg, #ffffff 0%, #f4f6f9 35%, #e9edf2 100%)",
                  borderRadius: "46% 54% 42% 58% / 38% 42% 58% 62%",
                  boxShadow: "0 25px 70px rgba(0,0,0,0.22), inset 0 2px 15px rgba(255,255,255,0.6)",
                }}
              />
            </div>

            {/* C. Thin white loop line — organic ellipse (z-30) */}
            <div className="absolute inset-0 z-[30] pointer-events-none" aria-hidden="true">
              <motion.svg
                viewBox="0 0 500 500"
                className="absolute inset-0 h-full w-full"
                animate={shouldReduceMotion ? undefined : { rotate: [0, 360] }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              >
                <ellipse
                  cx="250"
                  cy="255"
                  rx="225"
                  ry="190"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.2"
                  strokeDasharray="14 10"
                />
              </motion.svg>
            </div>

            {/* D. Student image — z-40, NOT circular */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="absolute inset-0 z-[40] flex items-center justify-center"
            >
              <img
                src={heroImage}
                alt="Smiling student holding colorful notebooks"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-[82%] w-[82%] object-cover object-top"
                style={{
                  borderRadius: "48% 52% 44% 56% / 42% 46% 54% 58%",
                  boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
                }}
              />
            </motion.div>

            {/* E. Small decorative accents (z-50) */}
            <div className="absolute inset-0 z-[50] pointer-events-none" aria-hidden="true">
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -right-1 top-[12%] h-3 w-3 rounded-full bg-secondary-500/50 sm:h-3.5 sm:w-3.5"
              />
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, 4, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.2 }}
                className="absolute left-[5%] bottom-[18%] h-2.5 w-2.5 rounded-full bg-primary-300/30"
              />
              <div className="absolute left-[12%] top-[6%] h-1.5 w-1.5 rounded-full bg-white/20" />
            </div>

            {/* Mobile decorative icons (hidden on lg+) */}
            <div className="absolute inset-0 z-[55] pointer-events-none lg:hidden" aria-hidden="true">
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity }}
                className="absolute -right-3 top-[3%] opacity-20"
              >
                <Rocket className="h-4 w-4 text-secondary-400" strokeWidth={1.5} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}