import { motion } from "framer-motion";
import { FiTrendingUp, FiBriefcase, FiAward, FiActivity } from "react-icons/fi";

const cards = [
  {
    icon: <FiTrendingUp />,
    type: "Freshers",
    desc: "Kickstart your professional track utilizing intensive workflows tailored to high-demand engineering expectations.",
    color: "text-blue-400",
    border: "hover:border-blue-500/30",
    glow: "rgba(59,130,246,0.08)",
    bg: "from-blue-500/10 to-transparent",
    badge: "bg-blue-500/10 border-blue-500/20 text-blue-300",
  },
  {
    icon: <FiBriefcase />,
    type: "Working Professionals",
    desc: "Upskill seamlessly. Scale horizontal cross-discipline competencies or accelerate leadership promotions.",
    color: "text-purple-400",
    border: "hover:border-purple-500/30",
    glow: "rgba(168,85,247,0.08)",
    bg: "from-purple-500/10 to-transparent",
    badge: "bg-purple-500/10 border-purple-500/20 text-purple-300",
  },
  {
    icon: <FiAward />,
    type: "College Students",
    desc: "Acquire specialized job-ready skills concurrently, positioning above market baselines ahead of graduation.",
    color: "text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow: "rgba(16,185,129,0.08)",
    bg: "from-emerald-500/10 to-transparent",
    badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  },
  {
    icon: <FiActivity />,
    type: "Career Switchers",
    desc: "Engineer clean architectural career shifts into foundational or highly specialized modern tech tracks smoothly.",
    color: "text-rose-400",
    border: "hover:border-rose-500/30",
    glow: "rgba(244,63,94,0.08)",
    bg: "from-rose-500/10 to-transparent",
    badge: "bg-rose-500/10 border-rose-500/20 text-rose-300",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Eligibility() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712] flex flex-col justify-center py-12 md:py-16 lg:py-20">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-blue-500/8 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-purple-500/8 blur-[150px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-blue-500/20 backdrop-blur-xl text-blue-300 text-sm font-medium mb-4">
            🎯 Who This Is For
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Who Can{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Apply?
            </span>
          </h2>
          <p className="mt-3 text-slate-400 text-base leading-relaxed">
            Flexible cohorts mapped purposefully across various experiential vectors.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className={`group relative rounded-2xl p-6 border border-slate-800 bg-gradient-to-b from-slate-900/40 to-slate-950/60 backdrop-blur-sm overflow-hidden transition-all duration-300 ${card.border}`}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 40px ${card.glow}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* Radial glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 10% 10%, ${card.glow} 0%, transparent 65%)` }}
              />

              {/* Icon circle */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 border transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br ${card.bg} border-slate-700/50 ${card.color}`}>
                {card.icon}
              </div>

              {/* Badge */}
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-3 ${card.badge}`}>
                {card.type}
              </span>

              <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors duration-200">
                {card.desc}
              </p>

              {/* Bottom index */}
              <div className="absolute bottom-4 right-5 text-xs font-mono text-slate-700 group-hover:text-slate-600 transition-colors select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA strip */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-white/[0.03] backdrop-blur-md px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-base">Ready to find your fit?</p>
            <p className="text-slate-400 text-sm mt-0.5">Talk to an advisor and identify the right cohort for you.</p>
          </div>
          <button className="flex-shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
            Book a Free Counselling →
          </button>
        </div>
      </div>
    </section>
  );
}