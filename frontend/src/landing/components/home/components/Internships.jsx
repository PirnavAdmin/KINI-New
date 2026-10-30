import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NAVY = "#133B5D";
const TEAL = "#F39924";

// Reused from the Internships page hero — already communicates
// students + technology + mentorship, so no new asset needed.
const HERO_IMAGE =
  "https://i.pinimg.com/1200x/28/5a/31/285a31ee0fbd58dcc2e7b7ad99c0fdf7.jpg";

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
  });

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative flex min-h-[520px] w-full items-center sm:min-h-[560px] lg:min-h-[620px]">
        {/* Background image — LCP element, not lazy-loaded */}
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Navy overlay — stronger left (text side), lighter right (image visible) */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${NAVY}F2 0%, ${NAVY}C7 45%, ${NAVY}59 100%)`,
          }}
        />
        {/* Slight extra wash on small screens, where the image can't breathe as much */}
        <div className="absolute inset-0 bg-black/10 sm:hidden" aria-hidden="true" />

        <div className="relative mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-[650px]">
            <motion.span
              {...fadeUp(0)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: TEAL }} />
              Kini EdX Hub
            </motion.span>

            <motion.h1
              {...fadeUp(0.08)}
              className="mt-4 font-extrabold leading-[1.1] tracking-tight text-white"
              style={{ fontSize: "clamp(2.1rem, 4vw, 4.5rem)" }}
            >
              Build skills.<br />
              Build real projects.<br />
              <span style={{ color: TEAL }}>Build your future.</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.16)}
              className="mt-5 max-w-[560px] text-[15px] leading-7 text-white/80 sm:text-base"
            >
              Kini EdX Hub helps students and professionals build job-ready technology
              skills through practical learning, real projects, mentorship, internships,
              and career-focused programs.
            </motion.p>

            <motion.div
              {...fadeUp(0.24)}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                to="/upskill-program"
                className="group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
                style={{ backgroundColor: TEAL, color: NAVY }}
              >
                Explore Courses
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/internships"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                Explore Internships
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}