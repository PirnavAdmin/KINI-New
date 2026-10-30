import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Rocket,
  Brain,
  ShoppingCart,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

const projects = [
  {
    title: "AI Resume Analyzer",
    desc: "Built using Python, NLP, and Machine Learning to analyze resumes and provide intelligent career recommendations.",
    icon: Brain,
    live: "/projects/resume-analyzer",
    code: "/contact",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "E-Commerce Backend",
    desc: "Scalable backend architecture with Node.js, Express, MongoDB, JWT authentication, and payment gateway integration.",
    icon: ShoppingCart,
    live: "/projects/ecommerce-backend",
    code: "/contact",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "ChatGPT Clone",
    desc: "Full-stack AI chatbot built using React, OpenAI API, Node.js, and modern conversational UI patterns.",
    icon: MessageSquare,
    live: "/projects/chatgpt-clone",
    code: "/contact",
    gradient: "from-orange-500 to-red-500",
  },
];

export default function ProjectsSection() {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 overflow-hidden bg-[#030712]">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-cyan-500/10 blur-[180px]" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-purple-500/10 blur-[180px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/5 blur-[220px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-cyan-500/20 backdrop-blur-xl text-cyan-300 text-sm font-medium">
            <Rocket size={16} />
            Real World Projects
          </div>

          <h2 className="mt-6 text-5xl md:text-6xl font-bold text-white">
            Build Industry Level
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Portfolio Projects
            </span>
          </h2>

          <p className="mt-6 text-slate-400 max-w-3xl mx-auto text-lg">
            Work on production-ready projects that recruiters love.
            Gain practical experience while building an impressive
            portfolio for top tech companies.
          </p>

          <div className="flex justify-center mt-8">
            <div className="w-24 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {projects.map((project, index) => {
            const Icon = project.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border border-white/10
                  bg-white/[0.04]
                  backdrop-blur-2xl
                  p-8
                  hover:border-cyan-400/30
                  transition-all
                  duration-500
                "
              >
                {/* Hover Glow */}
                <div
                  className={`
                    absolute inset-0 opacity-0
                    group-hover:opacity-100
                    transition duration-500
                    bg-gradient-to-br ${project.gradient}
                  `}
                  style={{
                    opacity: 0.05,
                  }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`
                      w-16 h-16 rounded-2xl
                      bg-gradient-to-r ${project.gradient}
                      flex items-center justify-center
                      shadow-xl
                    `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-6 text-2xl font-bold text-white">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-4 text-slate-400 leading-relaxed">
                    {project.desc}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                      React
                    </span>

                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                      Node.js
                    </span>

                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                      MongoDB
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => navigate(project.live)}
                      className="
                        flex-1
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-3
                        rounded-xl
                        text-white
                        font-medium
                        bg-gradient-to-r
                        from-cyan-500
                        to-blue-500
                        hover:scale-105
                        transition
                      "
                    >
                      Live Demo
                      <ArrowRight size={10} />
                    </button>

                    <button
                      onClick={() => navigate(project.code)}
                      className="
                        w-14
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        flex
                        items-center
                        justify-center
                        text-white
                        hover:bg-white/10
                        transition
                      "
                    >
                      <FaGithub size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <button
            onClick={() => navigate("/projects")}
            className="
              px-10
              py-4
              rounded-2xl
              text-white
              font-semibold
              bg-gradient-to-r
              from-cyan-500
              via-blue-500
              to-purple-600
              shadow-[0_20px_60px_rgba(59,130,246,0.35)]
              hover:scale-105
              transition-all
              duration-300
            "
          >
            View All Projects →
          </button>
        </div>
      </div>
    </section>
  );
}