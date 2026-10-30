import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   ANIMATED FOOTER — Premium CTA with large typography
   ──────────────────────────────────────────────────────────────
   Features:
     - 16vw headline with gradient text
     - Hover translateY animation on the large text
     - Subtle parallax as user scrolls
     - Clean CTA buttons
   ────────────────────────────────────────────────────────────── */

export default function AnimatedFooter() {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const textScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-x-hidden"
      style={{ background: "#050B18" }}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "#3B82F6" }}
        />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
          style={{ background: "#8B5CF6" }}
        />
      </motion.div>

      {/* Border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 text-center"
        style={{ scale: textScale }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 border border-white/10 bg-white/5 text-white/50"
        >
          <Sparkles size={14} />
          Begin Your Journey
        </motion.div>

        {/* ── Large Typography ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="overflow-hidden mb-8"
        >
          {/* Hover animation group */}
          <div className="group cursor-default">
            <h2
              className="text-[12vw] sm:text-[16vw] font-black leading-[0.85] tracking-[-0.06em] select-none transition-all duration-500 ease-out"
              style={{ color: "rgba(255,255,255,0.08)" }}
            >
              <span
                className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] transition-all duration-500 group-hover:translate-y-[-0.05em] inline-block"
              >
                Pirnav
              </span>
              <br />
              <motion.span
                className="inline-block transition-all duration-500 group-hover:translate-y-[-0.03em]"
                initial={{ opacity: 0.5 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#EC4899] via-[#F59E0B] to-[#3B82F6]">
                  EduHub
                </span>
              </motion.span>
            </h2>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          data-aos="fade-up"
          data-aos-delay="200"
          data-aos-duration="800"
          className="text-base sm:text-lg max-w-lg mx-auto mb-10"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Join the next generation of tech professionals.
          Your dream career is one decision away.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          data-aos="zoom-in"
          data-aos-delay="300"
          data-aos-duration="800"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/signup"
            className="group inline-flex items-center justify-center gap-2 font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[.98]"
            style={{
              height: 56,
              paddingLeft: 36,
              paddingRight: 36,
              borderRadius: 18,
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
              boxShadow: "0 15px 40px rgba(99,102,241,.35)",
              border: "none",
              fontSize: 15,
            }}
          >
            Get Started Free
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          <a
            href="/courses"
            className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 hover:bg-white/10 active:scale-[.98]"
            style={{
              height: 56,
              paddingLeft: 28,
              paddingRight: 28,
              borderRadius: 18,
              background: "rgba(255,255,255,.05)",
              border: "1px solid rgba(255,255,255,.1)",
              backdropFilter: "blur(24px)",
              color: "rgba(255,255,255,.65)",
              fontSize: 15,
            }}
          >
            View Programs
          </a>
        </motion.div>

        {/* Trust metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.55 }}
          data-aos="flip-up"
          data-aos-delay="400"
          data-aos-duration="800"
          className="flex flex-wrap items-center justify-center gap-8 mt-16"
        >
          {[
            { value: "25K+", label: "Learners" },
            { value: "92%", label: "Placement Rate" },
            { value: "50+", label: "Expert Mentors" },
            { value: "200+", label: "Projects" },
          ].map((metric, i) => (
            <div key={i} className="text-center">
              <p
                className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#A855F7]"
              >
                {metric.value}
              </p>
              <p className="text-xs text-white/30 mt-0.5">{metric.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Bottom links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.65 }}
          data-aos="fade-up"
          data-aos-delay="500"
          data-aos-duration="800"
          className="flex flex-wrap items-center justify-center gap-6 mt-16 pb-8"
        >
          {["Privacy Policy", "Terms of Service", "Contact Us"].map(
            (link, i) => (
              <a
                key={i}
                href="#"
                className="text-xs text-white/20 hover:text-white/50 transition-colors duration-200"
              >
                {link}
              </a>
            )
          )}
          <span className="text-xs text-white/10">
            &copy; 2026 Pirnav EduHub
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
