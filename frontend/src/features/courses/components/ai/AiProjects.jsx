import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Bot,
  Image,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const projects = [
  {
    title: "ChatGPT Clone",
    description: "AI chatbot with OpenAI APIs",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-600",
  },
  {
    title: "AI Image Generator",
    description: "Create images using AI",
    icon: Image,
    color: "from-purple-500 to-pink-600",
  },
  {
    title: "Recommendation Engine",
    description: "Smart suggestion system",
    icon: Brain,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Resume Analyzer",
    description: "AI resume screening tool",
    icon: Bot,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Fraud Detection",
    description: "Detect anomalies in data",
    icon: ShieldCheck,
    color: "from-indigo-500 to-purple-600",
  },
  {
    title: "Predictive Analytics",
    description: "Forecast trends with AI",
    icon: BarChart3,
    color: "from-sky-500 to-cyan-600",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const AiProjects = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-12 bg-[#020617] overflow-hidden">

      {/* Animated Background Blobs */}
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[120px]"
      />

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[120px]"
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">

        {/* Header Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            AI Project Portfolio
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Build real-world AI applications for your career
          </p>
        </motion.div>

        {/* Cards Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
        >
          {projects.map((project, index) => {
            const Icon = project.icon;

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  scale: 1.07,
                  y: -5,
                }}
                className="
                  min-w-[230px]
                  snap-start
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  backdrop-blur-xl
                  p-4
                  relative
                  overflow-hidden
                  flex-shrink-0
                  hover:border-cyan-400/40
                  transition
                "
              >
                {/* Glow */}
                <div
                  className={`absolute inset-0 opacity-10 bg-gradient-to-br ${project.color}`}
                />

                <div className="relative z-10">

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${project.color} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-white font-semibold text-sm">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={() => navigate("/contact")}
                    className="
                      mt-4 w-full py-2
                      rounded-lg text-xs font-medium text-white
                      bg-gradient-to-r from-cyan-500 to-blue-600
                      hover:scale-105 transition
                    "
                  >
                    Enroll
                  </button>

                  {/* Arrow */}
                  <motion.div
                    whileHover={{ rotate: 20 }}
                    onClick={() => navigate("/ai-curriculum")}
                    className="
                      absolute top-3 right-3
                      w-7 h-7
                      rounded-md
                      bg-white/5
                      flex items-center justify-center
                      hover:bg-white/10
                      cursor-pointer
                    "
                  >
                    <ArrowRight className="w-4 h-4 text-cyan-400" />
                  </motion.div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate("/contact")}
            className="
              px-6 py-2.5
              rounded-lg text-sm font-semibold text-white
              bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600
              hover:scale-105 transition
            "
          >
            Explore All Projects →
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default AiProjects;