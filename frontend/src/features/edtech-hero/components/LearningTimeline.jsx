import { motion } from "framer-motion";

const STEPS = [
  { label: "Enroll", icon: "📝" },
  { label: "Learn", icon: "📚" },
  { label: "Practice", icon: "💻" },
  { label: "Projects", icon: "🚀" },
  { label: "Mentorship", icon: "🎯" },
  { label: "Certification", icon: "🏆" },
  { label: "Placement", icon: "💼" },
];

export default function LearningTimeline() {
  return (
    <section
      className="relative py-20 sm:py-24 overflow-hidden"
      style={{ background: "#071226" }}
    >
      {/* Subtle top border glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(99,102,241,.3), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          data-aos="fade-up"
          data-aos-duration="800"
          className="text-center mb-14"
        >
          <p
            className="text-sm font-medium uppercase tracking-[0.2em] mb-3"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            Your Learning Journey
          </p>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold"
            style={{ color: "rgba(255,255,255,.9)" }}
          >
            From{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #60A5FA, #A855F7)",
              }}
            >
              Zero to Hired
            </span>
            , We Guide You Every Step
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div
            className="absolute top-[18px] left-0 right-0 h-px hidden md:block"
            style={{ background: "rgba(255,255,255,.08)" }}
          />

          {/* Animated progress line */}
          <motion.div
            className="absolute top-[18px] left-0 h-px hidden md:block"
            style={{ background: "linear-gradient(90deg, #60A5FA, #A855F7)" }}
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 md:gap-0">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                data-aos="zoom-in"
                data-aos-delay={i * 100}
                data-aos-duration="700"
                className="flex flex-col items-center text-center relative"
              >
                {/* Step dot */}
                <motion.div
                  className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm mb-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(96,165,250,.2), rgba(168,85,247,.2))",
                    border: "1.5px solid rgba(255,255,255,.1)",
                  }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "1px solid rgba(99,102,241,.3)",
                    }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <span className="relative">{step.icon}</span>
                </motion.div>

                {/* Label */}
                <p
                  className="text-xs font-medium"
                  style={{ color: "rgba(255,255,255,.6)" }}
                >
                  {step.label}
                </p>

                {/* Arrow (last item hidden) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute -right-3 top-[13px]"
                    style={{ color: "rgba(255,255,255,.15)" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
