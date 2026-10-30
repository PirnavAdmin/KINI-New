import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

const LINE1 = "Learn.";
const LINE2 = "Build.";
const LINE3 = "Achieve.";
const LINE4 = "Your Dream Career.";

const gradientSteps = [
  { colors: "#60A5FA, #818CF8, #A855F7" },
  { colors: "#A855F7, #818CF8, #60A5FA" },
  { colors: "#818CF8, #A855F7, #60A5FA" },
  { colors: "#60A5FA, #A855F7, #818CF8" },
  { colors: "#60A5FA, #818CF8, #A855F7" },
];

export default function HeroContent() {

  return (
    <div className="relative z-10 flex flex-col justify-center">
      {/* Badge */}
      <motion.div {...fadeUp(0)} data-aos="fade-up" data-aos-duration="1000">
        <div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-8"
          style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.1)",
            backdropFilter: "blur(24px)",
            color: "rgba(255,255,255,.8)",
          }}
        >
          <span className="text-lg">🚀</span>
          Trusted by 25,000+ Learners
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div {...fadeUp(0.2)} data-aos="fade-up" data-aos-duration="1000">
        <h1
          className="font-black leading-[0.92] tracking-[-0.05em]"
          style={{
            fontSize: "clamp(3.2rem, 7vw, 5.5rem)",
            color: "#fff",
          }}
        >
          {LINE1}
          <br />
          <AnimatedGradient text={LINE2} />
          <br />
          <AnimatedGradient2 text={LINE3} />
          <br />
          <span style={{ color: "#fff" }}>{LINE4}</span>
        </h1>
      </motion.div>

      {/* Description */}
      <motion.p
        {...fadeUp(0.35)}
        data-aos="fade-up"
        data-aos-delay="150"
        data-aos-duration="1000"
        className="text-lg sm:text-xl leading-relaxed mt-6"
        style={{
          maxWidth: 560,
          color: "rgba(255,255,255,.72)",
          lineHeight: 1.8,
        }}
      >
        Master in-demand skills, learn from industry experts, build real-world
        projects, and land opportunities at top companies.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        {...fadeUp(0.45)}
        data-aos="zoom-in"
        data-aos-delay="300"
        data-aos-duration="1000"
        className="flex flex-wrap gap-4 mt-8"
      >
        <a
          href="/upskill-program"
          className="group relative inline-flex items-center justify-center gap-2 font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[.98] outline-none"
          style={{
            height: 56,
            paddingLeft: 32,
            paddingRight: 32,
            borderRadius: 18,
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            boxShadow: "0 15px 40px rgba(99,102,241,.35)",
            border: "none",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.08] transition-colors rounded-[18px]" />
          <span className="relative flex items-center gap-2">
            Explore Programs
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>

        <button
          className="inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 hover:bg-white/10 active:scale-[.98] outline-none"
          style={{
            height: 56,
            paddingLeft: 28,
            paddingRight: 28,
            borderRadius: 18,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.1)",
            backdropFilter: "blur(24px)",
            color: "rgba(255,255,255,.85)",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          <Play size={18} />
          Watch Success Stories
        </button>
      </motion.div>

      {/* Trusted text */}
      <motion.p
        {...fadeUp(0.55)}
        data-aos="flip-up"
        data-aos-delay="450"
        data-aos-duration="800"
        className="text-sm mt-6"
        style={{ color: "rgba(255,255,255,.35)" }}
      >
        No commitment required &middot; 24hr response &middot; Free consultation
      </motion.p>
    </div>
  );
}

function AnimatedGradient({ text }) {
  return (
    <span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: `linear-gradient(135deg, #60A5FA, #818CF8, #A855F7)`,
        backgroundSize: "200% 200%",
        animation: "gradientShift 6s ease infinite",
      }}
    >
      {text}
    </span>
  );
}

function AnimatedGradient2({ text }) {
  return (
    <span
      className="inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: `linear-gradient(135deg, #A855F7, #818CF8, #60A5FA)`,
        backgroundSize: "200% 200%",
        animation: "gradientShift2 6s ease infinite",
      }}
    >
      {text}
    </span>
  );
}
