import { motion } from "framer-motion";
import {
  FiMonitor,
  FiUsers,
  FiCpu,
  FiCompass,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";

const cards = [
  {
    icon: <FiMonitor />,
    title: "Live Instructor Led Classes",
    desc: "Interactive, real-time sessions featuring dynamic Q&As and direct personalized engagement.",
    accent: "from-blue-500 to-cyan-500",
    glow: "rgba(59,130,246,0.12)",
  },
  {
    icon: <FiUsers />,
    title: "Industry Experts",
    desc: "Learn technical methodologies curated and taught by working professionals from tech giants.",
    accent: "from-purple-500 to-pink-500",
    glow: "rgba(168,85,247,0.12)",
  },
  {
    icon: <FiCpu />,
    title: "Real World Projects",
    desc: "Build comprehensive portfolios mapped to architectural demands of scale enterprise workflows.",
    accent: "from-cyan-500 to-teal-500",
    glow: "rgba(20,184,166,0.12)",
  },
  {
    icon: <FiCompass />,
    title: "Career Mentorship",
    desc: "1:1 continuous career strategy alignment, mapping milestones directly to your desired roles.",
    accent: "from-orange-500 to-amber-500",
    glow: "rgba(249,115,22,0.12)",
  },
  {
    icon: <FiLayers />,
    title: "Mock Interviews",
    desc: "Rigorous technical mock drills replicating demanding interview parameters of top companies.",
    accent: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.12)",
  },
  {
    icon: <FiCheckCircle />,
    title: "Placement Assistance",
    desc: "End-to-end placement assistance with direct referral access via 500+ ecosystem hiring channels.",
    accent: "from-green-500 to-emerald-500",
    glow: "rgba(34,197,94,0.12)",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function WhyChooseUs() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712] flex flex-col justify-center py-12 md:py-16 lg:py-20">

      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/8 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/8 blur-[160px] pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[200px] pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-purple-500/20 backdrop-blur-xl text-purple-300 text-sm font-medium mb-4">
            🏆 Why We're Different
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Why Students{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Choose Us
            </span>
          </h2>
          <p className="mt-3 text-slate-400 text-base leading-relaxed">
            Engineered to systematically advance your career through immersive
            upskilling architectures.
          </p>
        </div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.25 }}
              className="group relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950/80 p-6 backdrop-blur-md overflow-hidden hover:border-slate-600/50 transition-all duration-300"
              style={{
                boxShadow: `0 0 0 rgba(0,0,0,0)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 40px ${card.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0)`;
              }}
            >
              {/* Per-card radial glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 20% 20%, ${card.glow.replace("0.12", "0.18")} 0%, transparent 70%)`,
                }}
              />

              {/* Top accent line */}
              <div
                className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${card.accent} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
              />

              {/* Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg border mb-4 transition-all duration-300
                  bg-slate-800/50 border-slate-700/50 text-slate-300
                  group-hover:bg-gradient-to-br group-hover:${card.accent} group-hover:text-white group-hover:border-transparent group-hover:scale-110 group-hover:shadow-lg`}
              >
                {card.icon}
              </div>

              {/* Text */}
              <h3 className="text-base font-bold text-slate-100 mb-2 group-hover:text-white transition-colors duration-200">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors duration-200">
                {card.desc}
              </p>

              {/* Bottom card number */}
              <div className="absolute bottom-4 right-5 text-xs font-mono text-slate-700 group-hover:text-slate-600 transition-colors duration-200 select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            { value: "10K+", label: "Students Trained" },
            { value: "95%", label: "Placement Rate" },
            { value: "500+", label: "Hiring Partners" },
            { value: "4.9★", label: "Avg Rating" },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-white/[0.03] backdrop-blur-md px-5 py-4 text-center hover:border-slate-600/50 transition-colors duration-300"
            >
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}