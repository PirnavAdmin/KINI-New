import { motion } from "framer-motion";
import { FaReact, FaExternalLinkAlt, FaGithub } from "react-icons/fa";

const reactProjects = [
  {
    title: "Netflix Clone",
    desc: "Built using React, Firebase Authentication, TMDB API, and responsive UI with modern streaming experience.",
    tech: ["React", "Firebase", "TMDB API"],
    icon: <FaReact />,
    gradient: "from-red-500 to-pink-500",
  },
  {
    title: "E-Commerce Store",
    desc: "Complete shopping platform with cart management, payments, Redux Toolkit, and product filtering.",
    tech: ["React", "Redux", "Stripe"],
    icon: <FaReact />,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Admin Dashboard",
    desc: "Enterprise-grade dashboard with analytics, charts, role-based authentication, and data visualization.",
    tech: ["React", "Charts", "Dashboard"],
    icon: <FaReact />,
    gradient: "from-purple-500 to-indigo-500",
  },
];

export default function ReactProjectsSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030712] flex flex-col justify-center py-12 md:py-16">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[180px]" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-500/5 blur-[220px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-5 py-2 rounded-full border border-cyan-500/20 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-medium">
            🚀 Hands-On Learning
          </div>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white">
            Build Real
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              React Projects
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-base max-w-2xl mx-auto">
            Gain real-world experience by building production-ready applications
            used in modern companies and startups.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {reactProjects.map((project, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 hover:border-cyan-400/30 transition-all duration-500"
            >
              {/* Hover Glow */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br ${project.gradient}`}
                style={{ filter: "blur(120px)" }}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${project.gradient} flex items-center justify-center text-white text-2xl shadow-xl`}
                >
                  {project.icon}
                </div>

                {/* Title */}
                <h3 className="mt-5 text-xl font-bold text-white">{project.title}</h3>

                {/* Description */}
                <p className="mt-3 text-slate-400 text-sm leading-relaxed">{project.desc}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:scale-105 transition">
                    <FaExternalLinkAlt className="text-xs" />
                    Live Demo
                  </button>
                  <button className="px-4 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition flex items-center justify-center">
                    <FaGithub />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <div className="max-w-4xl mx-auto rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-8">
            <h3 className="text-2xl font-bold text-white">
              Ready to Build Portfolio-Worthy Projects?
            </h3>
            <p className="mt-3 text-slate-400 text-sm">
              Learn React through practical implementation and create projects that impress recruiters.
            </p>
            <button className="mt-6 px-10 py-3.5 rounded-2xl text-white font-semibold bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-[0_20px_60px_rgba(59,130,246,0.35)] hover:scale-105 transition-all duration-300">
              Start Building Projects →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}