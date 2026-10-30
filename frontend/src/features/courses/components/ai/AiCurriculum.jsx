import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Bot,
  Database,
  Cpu,
  BarChart3,
  Rocket,
} from "lucide-react";

const curriculum = [
  {
    phase: "P1",
    title: "Python AI",
    icon: Cpu,
    color: "from-cyan-500 to-blue-600",
    topics: ["Python", "Pandas", "NumPy"],
  },
  {
    phase: "P2",
    title: "ML Basics",
    icon: Brain,
    color: "from-purple-500 to-pink-600",
    topics: ["Regression", "Classification"],
  },
  {
    phase: "P3",
    title: "Deep Learning",
    icon: Bot,
    color: "from-orange-500 to-red-600",
    topics: ["Neural Nets", "CNN"],
  },
  {
    phase: "P4",
    title: "Data Eng",
    icon: Database,
    color: "from-emerald-500 to-green-600",
    topics: ["SQL", "ETL"],
  },
  {
    phase: "P5",
    title: "Analytics",
    icon: BarChart3,
    color: "from-blue-500 to-indigo-600",
    topics: ["Dashboards", "BI"],
  },
  {
    phase: "P6",
    title: "Gen AI",
    icon: Rocket,
    color: "from-pink-500 to-violet-600",
    topics: ["LLMs", "Prompts"],
  },
];

export default function AiCurriculum() {
  return (
    <section className="relative py-14 bg-[#020617] overflow-hidden">

      {/* Glow BG */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-[120px]" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          AI Curriculum
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Fast-track roadmap to become AI engineer
        </p>
      </motion.div>

      {/* Auto Scrolling Row (Right → Left) */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 18,
            ease: "linear",
          }}
        >
          {[...curriculum, ...curriculum].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.08, y: -5 }}
                className="
                  min-w-[200px]
                  bg-white/5
                  border border-white/10
                  backdrop-blur-xl
                  rounded-2xl
                  p-4
                  relative
                  overflow-hidden
                "
              >
                {/* glow */}
                <div
                  className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color}`}
                />

                <div className="relative z-10">

                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${item.color}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Phase */}
                  <p className="text-xs text-cyan-300 mt-3">{item.phase}</p>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>

                  {/* Topics */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.topics.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}