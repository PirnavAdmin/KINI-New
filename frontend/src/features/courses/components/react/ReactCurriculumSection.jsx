import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Atom,
  Component,
  Route,
  Database,
  Globe,
  Rocket,
} from "lucide-react";

const curriculum = [
  {
    icon: Atom,
    title: "React Fundamentals",
    duration: "Week 1 - 2",
    description:
      "JSX, Components, Props, State, Event Handling, Conditional Rendering",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Component,
    title: "Advanced React",
    duration: "Week 3 - 4",
    description:
      "Hooks, Context API, Custom Hooks, Performance Optimization",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Route,
    title: "React Router",
    duration: "Week 5",
    description:
      "Routing, Protected Routes, Nested Routes, Dynamic Routing",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Database,
    title: "API Integration",
    duration: "Week 6",
    description:
      "Axios, Fetch API, CRUD Operations, Authentication",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Globe,
    title: "Full Stack Projects",
    duration: "Week 7 - 8",
    description:
      "Build Real-world Applications using React & Backend APIs",
    color: "from-blue-500 to-indigo-500",
  },
];

const ReactCurriculumSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-28 bg-[#030712] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm backdrop-blur-xl">
            🚀 Industry Ready Curriculum
          </div>

          <h2 className="mt-6 text-5xl md:text-6xl font-bold text-white">
            React Developer
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Curriculum Roadmap
            </span>
          </h2>

          <p className="mt-6 text-slate-400 max-w-3xl mx-auto text-lg">
            Master React from fundamentals to advanced concepts and
            become job-ready through hands-on projects and mentorship.
          </p>
        </div>

        {/* Curriculum Cards */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {curriculum.map((item, index) => {
            const Icon = item.icon;

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
                  rounded-[30px]
                  border border-white/10
                  bg-white/[0.04]
                  backdrop-blur-2xl
                  p-8
                  hover:border-cyan-400/30
                  transition-all
                  duration-500
                "
              >
                {/* Glow Effect */}
                <div
                  className={`
                    absolute inset-0 opacity-0
                    group-hover:opacity-100
                    transition-all duration-500
                    bg-gradient-to-br ${item.color}
                  `}
                  style={{ opacity: 0.05 }}
                />

                <div className="relative z-10">
                  <div
                    className={`
                      w-16 h-16 rounded-2xl
                      bg-gradient-to-r ${item.color}
                      flex items-center justify-center
                      shadow-xl
                    `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <span className="inline-block mt-5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs">
                    {item.duration}
                  </span>

                  <h3 className="mt-4 text-2xl font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <div
            className="
              rounded-[32px]
              border border-white/10
              bg-white/[0.04]
              backdrop-blur-2xl
              p-10
              text-center
            "
          >
            <Rocket className="w-14 h-14 text-cyan-400 mx-auto mb-5" />

            <h3 className="text-3xl font-bold text-white">
              Ready to Become a React Developer?
            </h3>

            <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
              Learn React, build projects, get mentorship, and prepare
              for high-paying frontend developer roles.
            </p>

            <div className="flex flex-wrap justify-center gap-5 mt-8">
              <button
                onClick={() => navigate("/react-curriculum")}
                className="
                  px-8 py-4
                  rounded-2xl
                  text-white
                  font-semibold
                  bg-gradient-to-r
                  from-cyan-500
                  via-blue-500
                  to-purple-600
                  hover:scale-105
                  transition-all
                  duration-300
                  shadow-[0_20px_60px_rgba(59,130,246,0.35)]
                "
              >
                View Full Curriculum →
              </button>

              <button
                onClick={() => navigate("/enrollment")}
                className="
                  px-8 py-4
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  text-white
                  font-semibold
                  hover:bg-white/10
                  transition-all
                "
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReactCurriculumSection;